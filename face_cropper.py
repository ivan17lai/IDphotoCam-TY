import cv2
import sys
import os
import argparse

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)



def crop_face(image_path, output_path, model_input, scale_factor=1.6, high_correction=15):
    face_cascade_file = resource_path(model_input)
    face_cascade = cv2.CascadeClassifier(face_cascade_file)
    image = cv2.imread(image_path)
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray_image, 1.3, 5)

    if len(faces) == 0:  # If no faces detected, save the original image

        return "Failed"


    for (x, y, w, h) in faces:
        aspect_ratio = 6 / 5
        new_w = int(h * aspect_ratio * scale_factor)
        new_h = int(h * scale_factor)
        x_center = x + w // 2
        y_start = max(y - (new_h - h) // 2, 0) - high_correction
        x_start = max(x_center - new_w // 2, 0)
        
        new_w -= new_w % 5 

        x_end = x_start + new_w
                
        target_height = int(new_w * 1.2)
        
        y_end = y_start + target_height
        
        cropped_image = image[y_start:y_end, x_start:x_end]
        
        # Check if the cropped image is within the boundaries of the input image
        
        if y_start < 0 or y_end > image.shape[0] or x_start < 0 or x_end > image.shape[1]:
            return "Failed"
        else:
            cv2.imwrite(output_path, cropped_image)
            return "Success"


def main(args):
    result_path = args.output_path + "\\" + args.output_filename
    result = crop_face(args.image_path, result_path, args.model_xml, args.scale_factor, args.high_correction)
    print(result)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Crop a face from an image')
    parser.add_argument('image_path', type=str, help='Path to the input image')
    parser.add_argument('output_filename', type=str, help='Name of the output file')
    parser.add_argument('output_path', type=str, help='Path to save the output file')
    parser.add_argument('model_xml', type=str, default="haarcascade_frontalface_default.xmls" ,help='Path to the .xml')
    parser.add_argument('--scale_factor', type=float, default=1.8, help='Scale factor for the cropping (default: 1.8)')
    parser.add_argument('--high_correction', type=int, default=15, help='High correction for the cropping (default: 15)')

    args = parser.parse_args()
    main(args)
