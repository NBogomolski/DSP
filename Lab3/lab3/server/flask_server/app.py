from flask import Flask, request, jsonify

import base64
import io
import cv2
import numpy as np

from correlation import outline_pattern

app = Flask(__name__)


# Define GET route
@app.route("/get", methods=["GET"])
def handle_get():
    # Send a simple message as response
    return "This is a GET request"


@app.route("/post", methods=["POST"])
def handle_post():
    # Extract the posted data from the request
    try:
        data = request.get_json()
        # Process the data as needed
        # remove metadata
        # index = data.find(',') + 1

        # # Extract the base64-encoded string without the prefix
        # message = data[index:]
        ref_img = data["referenceImage"]
        pattern_img = data["patternImage"]

        ref_img_path = "./received/referenceImage.jpg"
        pattern_img_path = "./received/patternImage.jpg"
        resulting_path = "./received/result.jpg"

        # print(data)
        save_base64_image(ref_img, ref_img_path)
        save_base64_image(pattern_img, pattern_img_path)

        outline_pattern(
            ref_img_path,
            pattern_img_path,
            resulting_path
        )
        result_b64 = read_image_as_base64(resulting_path)
        # Send a response back to the client
        return jsonify({ "message": "Posted message received ", "resultingImage": result_b64 })
    except Exception as err:
        print(err)
        return jsonify({"error": str(err)})


def save_base64_image(base64_string, output_path):
    try:
        # Decode the base64 string into bytes
        image_data = base64.b64decode(base64_string)

        # Convert the bytes to a numpy array
        nparr = np.frombuffer(image_data, np.uint8)

        # Decode the numpy array as an image
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Save the image to the specified output path
        cv2.imwrite(output_path, image)

        print(f"Image saved successfully at {output_path}")
    except Exception as e:
        print(f"Error: {e}")


def read_image_as_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            # Read the image file as binary data
            image_binary = image_file.read()

            # Encode the binary data as base64
            image_base64 = base64.b64encode(image_binary).decode("utf-8")

            return image_base64
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    app.run(debug=True)
