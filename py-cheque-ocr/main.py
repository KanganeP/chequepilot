from fastapi import FastAPI, UploadFile, File
import shutil
import os
import cv2
from ultralytics import YOLO
import easyocr

app = FastAPI()

# ----------------------------
# Folders
# ----------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------------------
# Load EasyOCR
# ----------------------------
reader = easyocr.Reader(['en'])

# ----------------------------
# Load YOLO Model
# ----------------------------
model = YOLO("model/best.pt")

# ----------------------------
# OCR Function
# ----------------------------
def read_text(image):

    results = reader.readtext(
        image,
        detail=0,
        paragraph=True
    )

    return " ".join(results)


# ----------------------------
# API
# ----------------------------
@app.post("/process/")
async def process_cheque(
    file: UploadFile = File(...)
):

    try:

        # Save image
        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        # Read image
        image = cv2.imread(file_path)

        # YOLO Prediction
        results = model.predict(
            source=image,
            conf=0.25
        )

        extracted_data = {
            "bankName": "",
            "ifscCode": "",
            "accountNumber": "",
            "chequeNumber": ""
        }

        # Loop through detected boxes
        for result in results:

            boxes = result.boxes

            for box in boxes:

                cls_id = int(
                    box.cls[0]
                )

                class_name = result.names[
                    cls_id
                ]

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0]
                )

                cropped = image[
                    y1:y2,
                    x1:x2
                ]

                text = read_text(
                    cropped
                )

                print(
                    class_name,
                    "=>",
                    text
                )

                if class_name == "bank_name":
                    extracted_data[
                        "bankName"
                    ] = text

                elif class_name == "ifsc_Code":
                    extracted_data[
                        "ifscCode"
                    ] = text

                elif class_name == "account_number":
                    extracted_data[
                        "accountNumber"
                    ] = text

                elif class_name == "cheque_number":
                    extracted_data[
                        "chequeNumber"
                    ] = text

        return {
            "success": True,
            "fileName": file.filename,
            "data": extracted_data
        }

    except Exception as e:

        print(e)

        return {
            "success": False,
            "message": str(e)
        }