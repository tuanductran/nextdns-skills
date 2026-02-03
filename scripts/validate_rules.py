import os
import sys
import re
from pathlib import Path

# Colors for output
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
NC = '\033[0m'

def print_error(message):
    print(f"{RED}❌ ERROR: {message}{NC}")

def print_success(message):
    print(f"{GREEN}✓ {message}{NC}")

def validate_referential_integrity():
    print("🔍 Checking referential integrity...")
    errors_found = False
    
    # Find all SKILL.md files
    skill_files = list(Path('skills').glob('**/SKILL.md'))
    
    for skill_file in skill_files:
        skill_dir = skill_file.parent
        skill_name = skill_dir.name
        print(f"\nChecking skill: {skill_name}")
        
        # 1. Check if all rule files are registered in SKILL.md
        rules_dir = skill_dir / 'rules'
        if rules_dir.is_dir():
            rule_files = list(rules_dir.glob('*.md'))
            skill_content = skill_file.read_text()
            
            for rule_file in rule_files:
                rule_basename = rule_file.name
                if f"(rules/{rule_basename})" not in skill_content:
                    print_error(f"Rule '{rule_file.stem}' exists but is not registered in {skill_file}")
                    errors_found = True
                else:
                    print_success(rule_file.stem)
        
        # 2. Check for rules referenced in SKILL.md that don't exist
        referenced_rules = re.findall(r'\[.*?\]\(rules/(.*?\.md)\)', skill_file.read_text())
        if referenced_rules:
            print(f"Validating referenced rules in {skill_name}...")
            for rule_ref in referenced_rules:
                rule_path = rules_dir / rule_ref
                if not rule_path.exists():
                    print_error(f"Rule referenced in {skill_file} does not exist: {rule_path}")
                    errors_found = True
                else:
                    print_success(rule_ref)
                    
    return not errors_found

def validate_frontmatter():
    print("\n🔍 Validating YAML frontmatter in rule files...")
    errors_found = False
    
    # Find all rule files
    rule_files = list(Path('skills').glob('**/rules/*.md'))
    
    for rule_file in rule_files:
        content = rule_file.read_text()
        
        # Check for YAML frontmatter
        if not content.startswith('---'):
            print_error(f"Missing YAML frontmatter in {rule_file}")
            errors_found = True
            continue
            
        # Extract frontmatter
        parts = content.split('---', 2)
        if len(parts) < 3:
            print_error(f"Invalid YAML frontmatter format in {rule_file}")
            errors_found = True
            continue
            
        frontmatter_raw = parts[1]
        
        # Check required fields (simple string checking to avoid PyYAML dependency)
        required_fields = ["title", "impact", "impactDescription", "type", "tags"]
        for field in required_fields:
            if not re.search(f"^{field}:", frontmatter_raw, re.MULTILINE):
                print_error(f"Missing required field '{field}' in {rule_file}")
                errors_found = True
        
        # Validate impact value
        impact_match = re.search(r'^impact:\s*(.*)', frontmatter_raw, re.MULTILINE)
        if impact_match:
            impact_value = impact_match.group(1).strip()
            if impact_value not in ["HIGH", "MEDIUM", "LOW"]:
                print_error(f"Invalid impact value '{impact_value}' in {rule_file} (must be HIGH, MEDIUM, or LOW)")
                errors_found = True
        
        # Validate type value
        type_match = re.search(r'^type:\s*(.*)', frontmatter_raw, re.MULTILINE)
        if type_match:
            type_value = type_match.group(1).strip()
            if type_value not in ["capability", "efficiency"]:
                print_error(f"Invalid type value '{type_value}' in {rule_file} (must be capability or efficiency)")
                errors_found = True
        
        # Check for description line after H1
        # Skip frontmatter, then find first H1 and ensure there is some non-blank line after it
        remaining_content = parts[2].strip()
        h1_match = re.search(r'^#\s+.*', remaining_content, re.MULTILINE)
        if h1_match:
            content_after_h1 = remaining_content[h1_match.end():].strip()
            if not content_after_h1:
                print_error(f"Missing description line after H1 title in {rule_file}")
                errors_found = True
                
    return not errors_found

def main():
    integrity_ok = validate_referential_integrity()
    frontmatter_ok = validate_frontmatter()
    
    if integrity_ok and frontmatter_ok:
        print(f"\n{GREEN}✅ All validations passed!{NC}")
        sys.exit(0)
    else:
        print(f"\n{RED}❌ Validations failed. Please fix the errors above.{NC}")
        sys.exit(1)

if __name__ == "__main__":
    main()
