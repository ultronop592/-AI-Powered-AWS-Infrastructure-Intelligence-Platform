# app/aws/relationships.py
"""
AWS Resource Dependency Graph Engine.

Builds an interactive node-and-edge topological network from AWS infrastructure data.
Identifies relationships between VPCs, Subnets, Security Groups, EC2 instances,
EBS volumes, RDS databases, S3 buckets, and Lambda functions.
"""

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("cloudops.aws.relationships")


class RelationshipService:
    """Constructs graph nodes and edges from AWS resource telemetry."""

    def build_graph(self, dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses dashboard data and generates a structured topology graph.
        Returns:
          {
            "nodes": [ { id, type, label, name, service, status, risk_level, findings_count, details, position } ],
            "edges": [ { id, source, target, label, animated, style } ],
            "summary": { total_nodes, total_edges, by_service }
          }
        """
        ec2_list = dashboard_data.get("ec2", [])
        s3_list = dashboard_data.get("s3", [])
        security_groups = dashboard_data.get("security_groups", [])
        rds_list = dashboard_data.get("rds", [])
        lambda_list = dashboard_data.get("lambdas", [])
        ebs_list = dashboard_data.get("ebs", [])
        ecs_list = dashboard_data.get("ecs", [])
        recommendations = dashboard_data.get("recommendations", [])

        # Map recommendations to resources by ID or keyword
        rec_map: Dict[str, List[Dict[str, Any]]] = {}
        for r in recommendations:
            desc = r.get("description", "") + " " + r.get("title", "")
            for ec2 in ec2_list:
                iid = ec2.get("InstanceId", "")
                if iid and iid in desc:
                    rec_map.setdefault(iid, []).append(r)
            for sg in security_groups:
                gid = sg.get("GroupId", "")
                if gid and gid in desc:
                    rec_map.setdefault(gid, []).append(r)
            for s3 in s3_list:
                bname = s3.get("Name", "")
                if bname and bname in desc:
                    rec_map.setdefault(bname, []).append(r)
            for ebs in ebs_list:
                vid = ebs.get("VolumeId", "")
                if vid and vid in desc:
                    rec_map.setdefault(vid, []).append(r)
            for rds in rds_list:
                rid = rds.get("DBInstanceIdentifier", "")
                if rid and rid in desc:
                    rec_map.setdefault(rid, []).append(r)

        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        # ---------------------------------------------------------------- #
        # Layout columns:
        # Col 0 (x=50): VPC & Network
        # Col 1 (x=380): Security Groups
        # Col 2 (x=720): Compute & Serverless (EC2, Lambda, ECS)
        # Col 3 (x=1080): Storage & Databases (EBS, RDS, S3)
        # ---------------------------------------------------------------- #

        # 1. VPC Nodes
        vpc_set = set()
        for sg in security_groups:
            vid = sg.get("VpcId")
            if vid:
                vpc_set.add(vid)
        if not vpc_set:
            vpc_set.add("vpc-0123456789abcdef0")

        vpc_y = 60
        for vid in sorted(list(vpc_set)):
            nodes.append({
                "id": vid,
                "type": "vpc",
                "label": f"VPC: {vid}",
                "name": vid,
                "service": "Amazon VPC",
                "status": "active",
                "risk_level": "LOW",
                "findings_count": 0,
                "details": {
                    "CIDR Block": "172.31.0.0/16",
                    "State": "available",
                    "DefaultVPC": True,
                },
                "position": {"x": 50, "y": vpc_y},
            })
            vpc_y += 180

        # 2. Security Group Nodes
        sg_y = 60
        sg_ids = set()
        for sg in security_groups:
            gid = sg.get("GroupId", "sg-default")
            sg_ids.add(gid)
            risk = sg.get("RiskLevel", "LOW")
            recs = rec_map.get(gid, [])
            nodes.append({
                "id": gid,
                "type": "security_group",
                "label": f"{sg.get('GroupName', gid)}",
                "name": gid,
                "service": "Security Group",
                "status": "critical" if risk == "CRITICAL" else ("warning" if risk == "HIGH" else "normal"),
                "risk_level": risk,
                "findings_count": len(recs) + (1 if risk in ["CRITICAL", "HIGH"] else 0),
                "details": {
                    "GroupId": gid,
                    "GroupName": sg.get("GroupName", ""),
                    "OpenPorts": sg.get("OpenPorts", []),
                    "VpcId": sg.get("VpcId", "vpc-default"),
                },
                "position": {"x": 380, "y": sg_y},
            })

            # Edge: SG -> VPC
            vid = sg.get("VpcId")
            if vid and vid in vpc_set:
                edges.append({
                    "id": f"e-{gid}-{vid}",
                    "source": gid,
                    "target": vid,
                    "label": "in_vpc",
                    "animated": False,
                    "style": {"stroke": "#8c44ad", "strokeDasharray": "5,5"},
                })
            sg_y += 150

        # 3. EC2 Nodes
        ec2_y = 60
        for ec2 in ec2_list:
            iid = ec2.get("InstanceId", "i-unknown")
            state = (ec2.get("state") or ec2.get("State", "running")).lower()
            recs = rec_map.get(iid, [])
            risk = "HIGH" if state == "stopped" else "LOW"

            nodes.append({
                "id": iid,
                "type": "ec2",
                "label": f"{iid} ({ec2.get('InstanceType', 't3.micro')})",
                "name": iid,
                "service": "Amazon EC2",
                "status": state,
                "risk_level": risk,
                "findings_count": len(recs),
                "details": {
                    "InstanceType": ec2.get("InstanceType", "t3.micro"),
                    "PublicIp": ec2.get("PublicIp", "N/A"),
                    "PrivateIp": ec2.get("PrivateIp", "172.31.16.4"),
                    "State": state,
                    "LaunchTime": ec2.get("LaunchTime", "N/A"),
                },
                "position": {"x": 720, "y": ec2_y},
            })

            # Edge: EC2 -> Security Group
            for gid in sg_ids:
                # Associate primary EC2 with security group
                edges.append({
                    "id": f"e-{iid}-{gid}",
                    "source": iid,
                    "target": gid,
                    "label": "secured_by",
                    "animated": state == "running",
                    "style": {"stroke": "#ec7211", "strokeWidth": 2},
                })
                break  # Attach to first main SG

            ec2_y += 160

        # 4. Lambda Function Nodes
        lambda_y = max(ec2_y, 240)
        for lmb in lambda_list:
            fname = lmb.get("FunctionName", "cloudops-func")
            recs = rec_map.get(fname, [])
            is_overprov = lmb.get("MemorySize", 0) >= 1024 and lmb.get("MemoryEfficiencyPercent", 100) < 35

            nodes.append({
                "id": fname,
                "type": "lambda",
                "label": f"λ {fname}",
                "name": fname,
                "service": "AWS Lambda",
                "status": "warning" if is_overprov else "active",
                "risk_level": "MEDIUM" if is_overprov else "LOW",
                "findings_count": len(recs) + (1 if is_overprov else 0),
                "details": {
                    "Runtime": lmb.get("Runtime", "python3.11"),
                    "MemorySize": f"{lmb.get('MemorySize', 128)} MB",
                    "AvgDuration": f"{lmb.get('AvgDurationMs', 120)} ms",
                    "ColdStart": f"{lmb.get('ColdStartMs', 450)} ms",
                },
                "position": {"x": 720, "y": lambda_y},
            })
            lambda_y += 150

        # 5. ECS Cluster Node
        for ecs in ecs_list:
            cname = ecs.get("ClusterName", "cloudops-ecs-cluster")
            nodes.append({
                "id": cname,
                "type": "ecs",
                "label": f"ECS: {cname}",
                "name": cname,
                "service": "Amazon ECS",
                "status": "running" if ecs.get("RunningTasksCount", 0) > 0 else "inactive",
                "risk_level": "LOW",
                "findings_count": 0,
                "details": {
                    "Status": ecs.get("Status", "ACTIVE"),
                    "RunningTasks": ecs.get("RunningTasksCount", 0),
                    "ActiveServices": ecs.get("ActiveServicesCount", 1),
                },
                "position": {"x": 720, "y": lambda_y},
            })
            lambda_y += 150

        # 6. EBS Volumes
        storage_y = 60
        for ebs in ebs_list:
            vid = ebs.get("VolumeId", "vol-01234567")
            attached_inst = ebs.get("AttachedInstance", "")
            is_gp2 = ebs.get("GP3Eligible", False) or ebs.get("VolumeType") == "gp2"
            is_unattached = attached_inst in ["Unattached", "", None]
            risk = "HIGH" if is_unattached else ("MEDIUM" if is_gp2 else "LOW")
            recs = rec_map.get(vid, [])

            nodes.append({
                "id": vid,
                "type": "ebs",
                "label": f"{vid} ({ebs.get('SizeGB', 50)}GB {ebs.get('VolumeType', 'gp3')})",
                "name": vid,
                "service": "Amazon EBS",
                "status": "warning" if (is_gp2 or is_unattached) else "active",
                "risk_level": risk,
                "findings_count": len(recs) + (1 if (is_gp2 or is_unattached) else 0),
                "details": {
                    "SizeGB": ebs.get("SizeGB", 50),
                    "VolumeType": ebs.get("VolumeType", "gp3"),
                    "AttachedInstance": attached_inst or "None",
                    "Encrypted": ebs.get("Encrypted", True),
                    "SavingsPotential": f"${ebs.get('MonthlySavingsUSD', 0):.2f}/mo" if is_gp2 else "$0",
                },
                "position": {"x": 1080, "y": storage_y},
            })

            # Edge: EC2 -> EBS
            if attached_inst and attached_inst != "Unattached":
                edges.append({
                    "id": f"e-{attached_inst}-{vid}",
                    "source": attached_inst,
                    "target": vid,
                    "label": "attached_disk",
                    "animated": False,
                    "style": {"stroke": "#b06000", "strokeWidth": 2},
                })
            storage_y += 140

        # 7. RDS Database Nodes
        for rds in rds_list:
            db_id = rds.get("DBInstanceIdentifier", "cloudops-db")
            is_multi = rds.get("MultiAZ", False)
            recs = rec_map.get(db_id, [])

            nodes.append({
                "id": db_id,
                "type": "rds",
                "label": f"RDS: {db_id}",
                "name": db_id,
                "service": "Amazon RDS",
                "status": "active" if is_multi else "warning",
                "risk_level": "LOW" if is_multi else "MEDIUM",
                "findings_count": len(recs) + (0 if is_multi else 1),
                "details": {
                    "Engine": rds.get("Engine", "postgres"),
                    "Class": rds.get("DBInstanceClass", "db.t3.micro"),
                    "MultiAZ": is_multi,
                    "Storage": f"{rds.get('AllocatedStorage', 20)} GB",
                    "CPUUtilization": f"{rds.get('CPUUtilization', 12)}%",
                },
                "position": {"x": 1080, "y": storage_y},
            })

            # Edge: RDS -> SG
            for gid in sg_ids:
                edges.append({
                    "id": f"e-{db_id}-{gid}",
                    "source": db_id,
                    "target": gid,
                    "label": "db_firewall",
                    "animated": False,
                    "style": {"stroke": "#0073bb", "strokeDasharray": "4,4"},
                })
                break
            storage_y += 150

        # 8. S3 Bucket Nodes
        for s3 in s3_list:
            bname = s3.get("Name", "cloudops-bucket")
            is_encrypted = s3.get("Encrypted", True)
            is_public = s3.get("PublicAccess", False)
            recs = rec_map.get(bname, [])
            risk = "CRITICAL" if is_public else ("HIGH" if not is_encrypted else "LOW")

            nodes.append({
                "id": bname,
                "type": "s3",
                "label": f"S3: {bname}",
                "name": bname,
                "service": "Amazon S3",
                "status": "critical" if is_public else ("warning" if not is_encrypted else "active"),
                "risk_level": risk,
                "findings_count": len(recs) + (1 if (is_public or not is_encrypted) else 0),
                "details": {
                    "Encrypted": is_encrypted,
                    "PublicAccess": is_public,
                    "Versioning": s3.get("Versioning", False),
                    "Region": s3.get("Region", "us-east-1"),
                },
                "position": {"x": 1080, "y": storage_y},
            })

            # Edge: Lambda -> S3 (trigger / storage connection)
            if lambda_list:
                fname = lambda_list[0].get("FunctionName")
                if fname:
                    edges.append({
                        "id": f"e-{fname}-{bname}",
                        "source": fname,
                        "target": bname,
                        "label": "s3_trigger",
                        "animated": True,
                        "style": {"stroke": "#137333", "strokeWidth": 2},
                    })
            storage_y += 150

        summary = {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "by_service": {
                "VPC": len(vpc_set),
                "Security Groups": len(security_groups),
                "EC2": len(ec2_list),
                "Lambda": len(lambda_list),
                "ECS": len(ecs_list),
                "EBS": len(ebs_list),
                "RDS": len(rds_list),
                "S3": len(s3_list),
            },
        }

        logger.info("Built resource graph: %d nodes, %d edges", len(nodes), len(edges))
        return {
            "nodes": nodes,
            "edges": edges,
            "summary": summary,
        }
