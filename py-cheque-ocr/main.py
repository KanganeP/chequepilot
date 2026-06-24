from fastapi import FastAPI, File, UploadFile,Form,  Query
from fastapi.staticfiles import StaticFiles
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import shutil
from io import BytesIO
from PIL import Image
import numpy as np
from PIL import Image
from ultralytics import YOLO
import matplotlib.pyplot as plt
import cv2
from pydantic import BaseModel
# import easyocr
import re
import os
import pandas as pd
import requests
from modules import get_bank_name,get_ifsc_code,get_accnt_no,get_cheque_number,get_bank_details

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


class RequestData(BaseModel):
    name: str
    
class BankDetailsRequest(BaseModel):
    ifsc: str
    account_number: str
    cheque_no: str
# reader = easyocr.Reader(['en'],gpu=True)
# model_path=r".\model\best.pt"
model_path = r"./model/best.pt"
model=YOLO(model_path)

razorpay_url = 'https://ifsc.razorpay.com/'
                
                
                



# Serve React build files


@app.post("/process/")
async def process_cheque(
    file: UploadFile = File(...)
):
    try:

        # Read uploaded image
        image_bytes = await file.read()

        image = Image.open(
            BytesIO(image_bytes)
        )

        image_array = np.array(image)

        # Predict using YOLO
        pred_img = model.predict(
            source=image_array,
            verbose=False
        )

        img_org = cv2.cvtColor(
            pred_img[0].orig_img,
            cv2.COLOR_BGR2RGB
        )

        bank_name = ""
        ifsc_code = ""
        account_number = ""
        cheque_number = ""

        results = {}

        for idx, cls in enumerate(
            pred_img[0].boxes.cls
        ):

            class_name = pred_img[0].names[
                float(cls)
            ]

            confidence = float(
                pred_img[0].boxes.conf[idx]
            )

            if (
                class_name not in results
                or confidence >
                results[class_name]["conf"]
            ):
                results[class_name] = {
                    "conf": confidence,
                    "box":
                    pred_img[0].boxes[idx]
                }

        for class_name, value in results.items():

            x1 = int(
                value["box"].xyxy[0][0]
            )
            y1 = int(
                value["box"].xyxy[0][1]
            )
            x2 = int(
                value["box"].xyxy[0][2]
            )
            y2 = int(
                value["box"].xyxy[0][3]
            )

            crop = img_org[
                y1:y2,
                x1:x2
            ]

            if class_name == "bank_name":
                bank_name = get_bank_name(crop)

            elif class_name == "ifsc_Code":
                ifsc_code = get_ifsc_code(crop)

            elif class_name == "account_number":
                account_number = get_accnt_no(crop)

            elif class_name == "cheque_number":
                cheque_number = get_cheque_number(crop)

        return {
            "success": True,
            "bankName": bank_name,
            "ifscCode": ifsc_code,
            "accountNumber": account_number,
            "chequeNumber": cheque_number
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }



@app.post("/get_bank_details/")
def get_bank_details(data:BankDetailsRequest):
    bank_details = {"IFSC":None,"ACCOUNT_NUMBER":None,"CHEQUE_NUMBER":None,"BANK":None,"ADDRESS":None,
            "CENTRE":None,"DISTRICT":None,"STATE":None,"CONTACT":None,
            "MICR":None,"STATE":None,"ISO3166":None,"CITY":None,"NEFT":None,
            "IMPS":None,"UPI":None,"BRANCH":None,"RTGS":None,"BANKCODE":None}
     
    print("data.ifsc==>>",data.ifsc)
    
    if len(data.ifsc)==0:
        return bank_details
    response = requests.get(razorpay_url+data.ifsc)
    
    result = response.json()
    print("==>>",result)
    if "Not Found" in result:
        bank_details = {"IFSC":None,"ACCOUNT_NUMBER":None,"CHEQUE_NUMBER":None,"BANK":None,"ADDRESS":None,
            "CENTRE":None,"DISTRICT":None,"STATE":None,"CONTACT":None,
            "MICR":None,"STATE":None,"ISO3166":None,"CITY":None,"NEFT":None,
            "IMPS":None,"UPI":None,"BRANCH":None,"RTGS":None,"BANKCODE":None}  
    
    else:
        bank_details = {"IFSC":result['IFSC'],"ACCOUNT_NUMBER":data.account_number,"CHEQUE_NUMBER":data.cheque_no,"BANK":result['BANK'],"ADDRESS":result['ADDRESS'],
            "CENTRE":result['CENTRE'],"DISTRICT":result['DISTRICT'],"STATE":result['STATE'],"CONTACT":result['CONTACT'],
            "MICR":result['MICR'],"STATE":result['STATE'],"ISO3166":result['ISO3166'],"CITY":result['CITY'],"NEFT":str(result['NEFT']),
            "IMPS":str(result['IMPS']),"UPI":str(result['UPI']),"BRANCH":result['BRANCH'],"RTGS":str(result['RTGS']),"BANKCODE":result['BANKCODE']}    
    return bank_details
    
    # return bank_details

# app.mount("/", StaticFiles(directory="build", html=True), name="react")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)