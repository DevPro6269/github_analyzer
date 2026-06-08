CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

CREATE TABLE IF NOT EXISTS github_profiles (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  username            VARCHAR(100) NOT NULL UNIQUE,
  name                VARCHAR(200),
  bio                 TEXT,
  location            VARCHAR(200),
  company             VARCHAR(200),
  blog                VARCHAR(300),
  avatar_url          VARCHAR(500),
  public_repos        INT DEFAULT 0,
  followers           INT DEFAULT 0,
  following           INT DEFAULT 0,
  account_age_days    INT DEFAULT 0,
  top_language        VARCHAR(100),
  most_starred_repo   VARCHAR(200),
  most_starred_count  INT DEFAULT 0,
  total_stars         INT DEFAULT 0,
  last_analyzed_at    DATETIME NOT NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
