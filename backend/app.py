from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

client = MongoClient('mongodb://localhost:27017')
db = client['python-weather']  # db name

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/items', methods=['POST', 'GET'])
def handle_users():
    if request.method == 'POST':
        body = request.json
        country = body['country']
        temperature = body['temperature']
        conditions = body['conditions']
        
        result = db['items'].insert_one({
            "country": country,
            "temperature": temperature,
            "conditions": conditions,
        })

        return jsonify({
            'status': "Data posted successfully in database",
            "id": str(result.inserted_id),
            "country": country,
            "temperature": temperature,
            "conditions": conditions,
        })

    if request.method == 'GET':
        allData = db['items'].find()
        dataJSON = []
        for data in allData:
            id = data.get('_id')
            country = data.get('country')
            temperature = data.get('temperature')
            conditions = data.get('conditions')

            dataDict = {
                "id": str(id),
                "country": country,
                "temperature": temperature,
                "conditions": conditions,
            }
            dataJSON.append(dataDict)

        return jsonify(dataJSON)

@app.route('/items/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def onedata(id):
    if request.method == 'GET':
        data = db['items'].find_one({"_id": ObjectId(id)})
        if data:
            dataDict = {
                "id": str(data["_id"]),
                "country": data['country'],
                "temperature": data['temperature'],
                "conditions": data['conditions'],
            }
            return jsonify(dataDict)
        else:
            return jsonify({"status": "Item not found"}), 404
    
    if request.method == 'DELETE':
        try:
            result = db['items'].delete_one({"_id": ObjectId(id)})
            if result.deleted_count == 1:
                return jsonify({"status": "Data id: " + id + " is deleted"})
            else:
                return jsonify({"status": "Item not found"}), 404
        except Exception as e:
            return jsonify({"status": "Error deleting item", "error": str(e)}), 500

if __name__ == '__main__':
    app.debug = True
    app.run()
