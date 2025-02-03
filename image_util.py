import base64
import os

def save_base64_image(base64_image_str, user_id, upload_folder):
    try:
        header, base64_data = base64_image_str.split(',')
        file_extension = header.split('/')[1].split(';')[0] if '/' in header else 'jpg'

        if file_extension not in {'jpeg', 'jpg', 'png'}:
            raise ValueError("Unsupported image format")

        # Decode the base64 image
        image_data = base64.b64decode(base64_data)

        # Generate a filename and path
        filename = f"{user_id}_profile.{file_extension}"
        file_path = os.path.join(upload_folder, filename)

        # Save the image
        with open(file_path, 'wb') as image_file:
            image_file.write(image_data)

        return file_path

    except (ValueError, base64.binascii.Error) as e:
        print(f"Image decoding or saving failed: {e}")
        return None