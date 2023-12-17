import cv2
import numpy as np


def outline_pattern(reference_path, pattern_path, output_path):
    # Load images
    reference_image = cv2.imread(reference_path)
    pattern_image = cv2.imread(pattern_path)

    # Convert images to grayscale
    reference_gray = cv2.cvtColor(reference_image, cv2.COLOR_BGR2GRAY)
    pattern_gray = cv2.cvtColor(pattern_image, cv2.COLOR_BGR2GRAY)

    # Perform template matching
    result = cv2.matchTemplate(reference_gray, pattern_gray, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    # Get coordinates of the matching region
    top_left = max_loc
    h, w = pattern_gray.shape

    # Draw a rectangle around the matching region
    cv2.rectangle(
        reference_image, top_left, (top_left[0] + w, top_left[1] + h), (0, 255, 0), 2
    )

    # Save the result
    cv2.imwrite(output_path, reference_image)


# if __name__ == "__main__":
#     # Provide the paths to your images
#     reference_image_path = "metallica.jpg"
#     pattern_image_path = "ulrich.png"
#     output_image_path = "result.jpg"

#     # Call the function
#     outline_pattern(reference_image_path, pattern_image_path, output_image_path)
