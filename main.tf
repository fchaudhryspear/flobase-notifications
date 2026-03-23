provider "aws" {
  region = "us-east-1" 
}

# 1. Networking (VPC)
resource "aws_vpc" "flobase_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
}

# 2. Database (RDS Postgres)
resource "aws_db_instance" "notification_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.micro"
  db_name              = "notifications_db"
  username             = "admin"
  password             = "secure_password_12345" # Update this later
  skip_final_snapshot  = true
  publicly_accessible  = false
}

# 3. Cache (ElastiCache Redis)
resource "aws_elasticache_cluster" "notification_cache" {
  cluster_id           = "flobase-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# 4. Compute (ECS Fargate Cluster)
resource "aws_ecs_cluster" "flobase_cluster" {
  name = "flobase-production"
}

# 5. Security (ALB & Security Groups)
resource "aws_security_group" "api_sg" {
  name        = "flobase-api-sg"
  vpc_id      = aws_vpc.flobase_vpc.id
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
