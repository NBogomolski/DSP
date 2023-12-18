import cv2
import numpy as np
import matplotlib.pyplot as plt


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

    heatmap = (result - min_val) / (max_val - min_val)
    
    # Display the heatmap
    plt.imshow(heatmap, cmap="viridis", interpolation="nearest")
    plt.axis('off')
    heatmap_output_path = output_path.replace(".jpg", "_heatmap.jpg")
    plt.savefig(heatmap_output_path, bbox_inches='tight', pad_inches=0)
    plt.close() 

    # Save the result
    cv2.imwrite(output_path, reference_image)


def outline_auto_correlation(image_path, output_path):
    # Load the image
    input_image = cv2.imread(image_path)

    # Convert the image to grayscale
    gray_image = cv2.cvtColor(input_image, cv2.COLOR_BGR2GRAY)

    # Perform auto-correlation using template matching
    result = cv2.matchTemplate(gray_image, gray_image, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    # Get coordinates of the matching region
    top_left = max_loc
    h, w = gray_image.shape

    # Draw a rectangle around the matching region
    cv2.rectangle(
        input_image, top_left, (top_left[0] + w, top_left[1] + h), (0, 255, 0), 2
    )

    # Save the result
    cv2.imwrite(output_path, input_image)


def create_correlation_heatmap(image_path, output_path):
    # Load the image
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Create a correlation matrix
    correlation_matrix = np.corrcoef(image)

    # Plot the correlation heatmap
    plt.imshow(
        correlation_matrix,
        cmap="viridis",
        interpolation="nearest",
        extent=[0, image.shape[1], 0, image.shape[0]],
    )
    plt.colorbar()
    plt.title("Correlation Heatmap")
    plt.show()

    # Segment the image based on the correlation coefficients (example: thresholding)
    threshold = 0.9
    binary_segmentation = np.where(correlation_matrix > threshold, 255, 0).astype(
        np.uint8
    )

    # Apply morphological operations for better segmentation results (optional)
    kernel = np.ones((5, 5), np.uint8)
    binary_segmentation = cv2.morphologyEx(binary_segmentation, cv2.MORPH_OPEN, kernel)
    binary_segmentation = cv2.morphologyEx(binary_segmentation, cv2.MORPH_CLOSE, kernel)

    # Save the segmented image
    cv2.imwrite(output_path, binary_segmentation)


# if __name__ == "__main__":
#     #     # Provide the paths to your images
#     reference_image_path = "metallica.jpg"
#     pattern_image_path = "hatfield.jpg"
#     output_image_path = "result.jpg"
#     # create_correlation_heatmap(reference_image_path, output_image_path)
# #     outline_auto_correlation(reference_image_path, output_image_path)
# #     # Call the function
#     outline_pattern(reference_image_path, pattern_image_path, output_image_path)
