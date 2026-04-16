import json

# Define the unified weight system to bridge legacy integers and new strings
weights = {"Beginner": 1, "Intermediate": 2, "Advanced": 3, 1: 1, 2: 2, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3}
inverse_weights = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}

# Load dictionary
with open('data/dictionary.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

# Build lookup table for script -> level weight
word_to_weight = {}
for w in words:
    script = w['marathi']['script']
    raw_level = w.get('level', "Beginner")
    word_to_weight[script] = weights.get(raw_level, 1)

# Load sentences
with open('data/sentences.json', 'r', encoding='utf-8') as f:
    sentences = json.load(f)

# Assign sentences
level_counts = {"Beginner": 0, "Intermediate": 0, "Advanced": 0}

for s in sentences:
    max_weight = 1
    for m in s['marathi']:
        val = word_to_weight.get(m['script'], 1)
        if val > max_weight:
            max_weight = val
            
    final_level = inverse_weights.get(max_weight, "Beginner")
    s['level'] = final_level
    
    if final_level in level_counts:
        level_counts[final_level] += 1
    else:
        level_counts[final_level] = 1

print("Sentence distribution:", level_counts)

# Write back
with open('data/sentences.json', 'w', encoding='utf-8') as f:
    json.dump(sentences, f, ensure_ascii=False, indent=2)

print("Updated sentences.json with new text-based levels safely computed from dictionary boundaries.")
