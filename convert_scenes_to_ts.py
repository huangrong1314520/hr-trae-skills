#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import urllib.parse

with open("/workspace/scenes_data.json", "r", encoding="utf-8") as f:
    scenes = json.load(f)

def word_to_ts(w):
    word, reading, romaji, pos, meaning, example, example_trans = w
    s = f'      {{ word: "{word}", reading: "{reading}", romaji: "{romaji}", pos: "{pos}", meaning: "{meaning}"'
    if example:
        s += f', example: "{example}", exampleTrans: "{example_trans}"'
    s += " },"
    return s

def grammar_to_ts(g):
    pattern, explanation, example, example_trans = g
    return f'      {{ pattern: "{pattern}", explanation: "{explanation}", example: "{example}", exampleTrans: "{example_trans}" }},'

lines = []
lines.append("const sceneCourses: SceneCourse[] = [")
for s in scenes:
    img_url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={urllib.parse.quote(s['image_prompt'])}&image_size=landscape_4_3"
    lines.append("  {")
    lines.append(f'    id: "{s["id"]}",')
    lines.append(f'    lang: "ja",')
    lines.append(f'    title: "{s["title"]}",')
    lines.append(f'    icon: "{s["icon"]}",')
    lines.append(f'    description: "{s["description"]}",')
    lines.append(f'    level: "{s["level"]}",')
    lines.append(f'    day: {s["day"]},')
    lines.append(f'    imageUrl: "{img_url}",')
    lines.append("    words: [")
    for w in s["words"]:
        lines.append(word_to_ts(w))
    lines.append("    ],")
    lines.append("    grammars: [")
    for g in s["grammars"]:
        lines.append(grammar_to_ts(g))
    lines.append("    ],")
    lines.append("  },")
lines.append("];")

output = "\n".join(lines)

with open("/workspace/scenes_ts.txt", "w", encoding="utf-8") as f:
    f.write(output)

print(f"Generated {len(scenes)} scenes as TypeScript")
print(f"Saved to scenes_ts.txt")
