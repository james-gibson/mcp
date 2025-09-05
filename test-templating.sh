#!/bin/bash

# Test script for S-expression templating functionality
# This script creates test files and verifies the templating system works

set -e  # Exit on any error

echo "=== Setting up test files ==="

# Create test template files
mkdir -p test-templates

# Create a simple prompt template
cat > test-templates/prompt.md << 'EOF'
# Test Prompt

This is a test prompt that includes some context:

@@include:context.txt@@

Please process this information and generate output.
EOF

# Create a context file to be included
cat > test-templates/context.txt << 'EOF'
This is context information that will be included in the prompt.
It contains important details for processing.
EOF

# Create a snippet file for post-processing
cat > test-templates/example.txt << 'EOF'
This is example content that will be inserted as a snippet.
EOF

# Create a documentation file for references
mkdir -p test-templates/docs

cat > test-templates/docs/api.md << 'EOF'
# API Documentation

This is API documentation that can be referenced.
EOF

echo "✓ Test files created"

echo ""
echo "=== Test 1: Basic S-expression parsing ==="
echo "Testing simple atom: prompt.md"
cd test-templates
node ../dist/main.js process-templates --templates "prompt.md" --dry-run
cd ..

echo ""
echo "=== Test 2: S-expression list parsing ==="
echo "Testing list: (prompt.md context.txt)"
cd test-templates
node ../dist/main.js process-templates --templates "(prompt.md context.txt)" --dry-run
cd ..

echo ""
echo "=== Test 3: Full processing with directives ==="
echo "Testing full workflow with @@include@@, @@snippet@@, and @@reference@@ directives"
cd test-templates
node ../dist/main.js process-templates --templates "prompt.md"
cd ..

echo ""
echo "=== Test 4: JSON output ==="
echo "Testing JSON output format"
cd test-templates
node ../dist/main.js process-templates --templates "prompt.md" --json
cd ..

echo ""
echo "=== Test 5: S-expression with comments ==="
echo "Testing S-expression with line comments"
cd test-templates
node ../dist/main.js process-templates --templates "(prompt.md ; This is a comment
context.txt)" --dry-run
cd ..

echo ""
echo "=== Test 6: S-expression with discard token ==="
echo "Testing S-expression with #_ discard token"
cd test-templates
node ../dist/main.js process-templates --templates "(prompt.md #_ ignored.txt context.txt)" --dry-run
cd ..

echo ""
echo "=== Test 7: Error handling - missing file ==="
echo "Testing error handling for missing template file"
cd test-templates
# Capture both stdout and stderr, check exit code
if node ../dist/main.js process-templates --templates "nonexistent.md" >/dev/null 2>&1; then
    echo "ERROR: Should have failed for missing file"
    exit 1
else
    echo "✓ Correctly handled missing file error"
fi
cd ..

echo ""
echo "=== Test 8: Error handling - invalid S-expression ==="
echo "Testing error handling for invalid S-expression syntax"
cd test-templates
# Capture both stdout and stderr, check exit code
if node ../dist/main.js process-templates --templates "(unclosed list" >/dev/null 2>&1; then
    echo "ERROR: Should have failed for invalid syntax"
    exit 1
else
    echo "✓ Correctly handled invalid S-expression error"
fi
cd ..

echo ""
echo "=== Test 9: Recursion detection - include directive ==="
echo "Testing recursion detection for @@include@@ directives"

# Recreate test-templates directory for recursion tests
mkdir -p test-templates
cd test-templates

# Create a file that includes itself
cat > recursive-include.md << 'EOF'
# Recursive Include Test

This file includes itself: @@include:recursive-include.md@@
EOF

if node ../dist/main.js process-templates --templates "recursive-include.md" >/dev/null 2>&1; then
    echo "ERROR: Should have failed for recursive include"
    exit 1
else
    echo "✓ Correctly detected recursive include"
fi

# Create circular include files
cat > circular-a.md << 'EOF'
# File A includes B
@@include:circular-b.md@@
EOF

cat > circular-b.md << 'EOF'
# File B includes A
@@include:circular-a.md@@
EOF

if node ../dist/main.js process-templates --templates "circular-a.md" >/dev/null 2>&1; then
    echo "ERROR: Should have failed for circular include"
    exit 1
else
    echo "✓ Correctly detected circular include"
fi

cd ..

echo ""
echo "=== Test 10: Recursion detection - snippet directive ==="
echo "Testing recursion detection for @@snippet@@ directives"

# Ensure we're in the test-templates directory
if [ ! -d "test-templates" ]; then
    mkdir -p test-templates
fi
cd test-templates

# Create a template that generates recursive snippets
cat > snippet-template.md << 'EOF'
# Template that will generate recursive snippets
This template will be processed.
EOF

# Create a snippet file that contains another snippet directive
cat > recursive-snippet.txt << 'EOF'
This snippet contains another snippet: @@snippet:recursive-snippet.txt@@
EOF

# Create a template that uses the recursive snippet
cat > snippet-test.md << 'EOF'
# Snippet Test
Content: @@snippet:recursive-snippet.txt@@
EOF

if node ../dist/main.js process-templates --templates "snippet-test.md" >/dev/null 2>&1; then
    echo "ERROR: Should have failed for recursive snippet"
    exit 1
else
    echo "✓ Correctly detected recursive snippet"
fi

cd ..

echo ""
echo "=== Final Cleanup ==="
rm -rf test-templates
echo "✓ Test files cleaned up"

echo ""
echo "=== All tests completed successfully! ==="
