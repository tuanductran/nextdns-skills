import os
import re
from pathlib import Path

def update_readme_counts():
    readme_path = Path('README.md')
    if not readme_path.exists():
        print("README.md not found.")
        return

    content = readme_path.read_text()
    categories = ['nextdns-api', 'nextdns-cli', 'nextdns-ui', 'integrations']
    
    updated_content = content
    for cat in categories:
        rules_path = Path('skills') / cat / 'rules'
        if rules_path.is_dir():
            count = len(list(rules_path.glob('*.md')))
            
            # Pattern to find the count in the table for a specific category link
            # Example: | [**NextDNS API**](skills/nextdns-api/SKILL.md) | **17** | ...
            pattern = rf'(\| \[.*?\]\(skills/{cat}/SKILL\.md\) \| \*\*)\d+(\*\* \|)'
            replacement = rf'\g<1>{count}\g<2>'
            
            if re.search(pattern, updated_content):
                updated_content = re.sub(pattern, replacement, updated_content)
                print(f"Updated {cat} count to {count}")
            else:
                print(f"Pattern for {cat} not found in README.md")

    if updated_content != content:
        readme_path.write_text(updated_content)
        print("README.md updated successfully.")
    else:
        print("No changes needed in README.md.")

    # Update CLAUDE.md counts
    claude_path = Path('CLAUDE.md')
    if claude_path.exists():
        content = claude_path.read_text()
        updated_content = content
        for cat in categories:
            rules_path = Path('skills') / cat / 'rules'
            if rules_path.is_dir():
                count = len(list(rules_path.glob('*.md')))
                # Pattern: ├── nextdns-api/            # 17 rules
                pattern = rf'({cat}/.*?# )\d+( rules)'
                replacement = rf'\g<1>{count}\g<2>'
                
                if re.search(pattern, updated_content):
                    updated_content = re.sub(pattern, replacement, updated_content)
                    print(f"Updated CLAUDE.md {cat} count to {count}")

        if updated_content != content:
            claude_path.write_text(updated_content)
            print("CLAUDE.md updated successfully.")
        else:
            print("No changes needed in CLAUDE.md.")

if __name__ == "__main__":
    update_readme_counts()
