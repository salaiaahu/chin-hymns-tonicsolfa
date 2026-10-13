from pathlib import Path
import base64,re
b=Path(__file__).resolve().parent
html=(b/'index.html').read_text(encoding='utf8')
css=(b/'styles.css').read_text(encoding='utf8')
data=(b/'hymn11-data.js').read_text(encoding='utf8')
js=(b/'app.js').read_text(encoding='utf8')
img=base64.b64encode((b/'original-hymn-11.jpg').read_bytes()).decode()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
html=html.replace('<script src="hymn11-data.js"></script>','<script>'+data+'</script>')
html=html.replace('<script src="app.js"></script>','<script>'+js+'</script>')
html=html.replace('src="original-hymn-11.jpg"','src="data:image/jpeg;base64,'+img+'"')
p=b/'Chin_Hymn_11_Mobile_Reader.html';p.write_text(html,encoding='utf8');print(p,p.stat().st_size)
