"""Copy the editable hymn JSON master into the browser data file."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
source = root / "hymn11.json"
target = root / "hymn11-data.js"
data = json.loads(source.read_text(encoding="utf-8"))
target.write_text(
    "// Generated from hymn11.json by sync_hymn_data.py. Do not edit directly.\n"
    "window.HYMN11 = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)
print(f"Updated {target.name} from {source.name}")
