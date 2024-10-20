import os
import requests
from dotenv import load_dotenv
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
import sys

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv('BRAVE_SEARCH_API_KEY')
BASE_URL = 'https://api.search.brave.com/res/v1'

def make_api_request(endpoint: str, query: str, params: dict = None) -> dict:
    url = f"{BASE_URL}/{endpoint}"
    headers = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': API_KEY
    }
    
    default_params = {
        'q': query,
        'count': 5
    }
    if params:
        default_params.update(params)
    
    try:
        response = requests.get(url, params=default_params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error making request to {endpoint} endpoint: {str(e)}")
        return {}

class SearchHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/search':
            query_params = parse_qs(parsed_path.query)
            query = query_params.get('query', [''])[0]
            search_type = query_params.get('type', ['web'])[0]

            if search_type == 'web':
                results = make_api_request('web/search', query)
            elif search_type == 'news':
                results = make_api_request('news/search', query)
            elif search_type == 'image':
                results = make_api_request('images/search', query)
            else:
                results = {'error': 'Invalid search type'}

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode())
        else:
            self.send_error(404, 'Not Found')

def run_server(port=8000):
    server_address = ('', port)
    try:
        httpd = HTTPServer(server_address, SearchHandler)
        print(f"Server running on port {port}")
        httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Error: Port must be a number.")
            sys.exit(1)
    else:
        port = 8000  # Default to port 8000 instead of 5000
    
    run_server(port)