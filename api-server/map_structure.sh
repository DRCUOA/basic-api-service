#!/bin/zsh

# 1. Fix PATH issues (Ensures 'ls', 'basename', etc. are found)
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH"

# Check for correct arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: ./map_structure.sh [target_directory] [output_filename.md]"
    exit 1
fi

# 2. Setup Variables (Using %/ to strip trailing slashes)
TARGET_DIR="${1%/}"
OUTPUT_FILE="$TARGET_DIR/$2"

# Configuration: Names to skip
EXCLUDES=("node_modules" "documentation" ".git" "dist" ".DS_Store")

# Header for the Markdown file
echo "# Project Structure: $(basename "$TARGET_DIR")" > "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo -e "\n\`\`\`text" >> "$OUTPUT_FILE"

# Recursive function to build the tree
list_files() {
  local current_dir=$1
  local prefix=$2

  # Using /bin/ls directly to avoid any alias or path issues
  # and capturing entries into a local array
  local entries
  entries=($(/bin/ls -1 "$current_dir" 2>/dev/null))

  local count=${#entries[@]}
  local i=0

  for entry in "${entries[@]}"; do
    i=$((i + 1))
    
    # Check if entry is in the exclusion list
    local skip=0
    for ex in "${EXCLUDES[@]}"; do
      if [[ "$entry" == "$ex" ]]; then
        skip=1
        break
      fi
    done
    [[ $skip -eq 1 ]] && continue

    local item_path="$current_dir/$entry"
    local connector="├── "
    local next_prefix="$prefix│   "

    # Handle the last item connector
    if [ "$i" -eq "$count" ]; then
      connector="└── "
      next_prefix="$prefix    "
    fi

    if [ -d "$item_path" ]; then
      echo "${prefix}${connector}📁 ${entry}" >> "$OUTPUT_FILE"
      list_files "$item_path" "$next_prefix"
    else
      echo "${prefix}${connector}📄 ${entry}" >> "$OUTPUT_FILE"
    fi
  done
}

# Run the function
echo "📁 $(basename "$TARGET_DIR")" >> "$OUTPUT_FILE"
list_files "$TARGET_DIR" ""

echo "\`\`\`" >> "$OUTPUT_FILE"

echo "Success! Tree saved to $OUTPUT_FILE"
