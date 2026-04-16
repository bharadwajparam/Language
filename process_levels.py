import json

# Load dictionary
with open('data/dictionary.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

# Build lookup table for script -> level
word_to_level = {}
for w in words:
    script = w['marathi']['script']
    word_to_level[script] = w.get('level', 1)

# Load sentences
with open('data/sentences.json', 'r', encoding='utf-8') as f:
    sentences = json.load(f)

# Assign sentences
level_counts = {i: 0 for i in range(1, 12)}
for s in sentences:
    max_level = 1
    for m in s['marathi']:
        val = word_to_level.get(m['script'], 1)
        if val > max_level:
            max_level = val
    s['level'] = max_level
    if max_level in level_counts:
        level_counts[max_level] += 1
    else:
        level_counts[max_level] = 1

print("Sentence distribution:", level_counts)

# Write back
with open('data/sentences.json', 'w', encoding='utf-8') as f:
    json.dump(sentences, f, ensure_ascii=False, indent=2)

print("Updated sentences.json with new levels based on dictionary.")
