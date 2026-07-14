import cv2
import re
import pytesseract
import numpy as np
import pandas as pd
import requests
import json

from io import BytesIO
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'.\Tesseract-OCR\tesseract.exe'

def preprocess_image(img):
    # Convert RGB to Gray
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Enlarge image
    gray = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    # Remove noise
    gray = cv2.GaussianBlur(gray, (3,3), 0)

    # Threshold
    gray = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]
    
    cv2.imwrite(
    "output/debug_preprocessed.jpg",
    gray
)

    return gray

def get_bank_name(cropped_img):

    img = preprocess_image(cropped_img)

    text = pytesseract.image_to_string(
        img,
        lang="eng",
        config="--psm 7"
    )

    text = re.sub(r'[^A-Za-z ]', '', text)
    text = text.strip().upper()

    print("Bank Name:", text)

    return text

def get_ifsc_code(cropped_img):

    img = preprocess_image(cropped_img)

    text = pytesseract.image_to_string(
        img,
        lang="eng",
        config="--psm 7"
    )

    text = text.replace(" ", "")
    text = text.replace("\n", "")
    text = text.upper()

    print("OCR IFSC:", text)

    match = re.search(
        r"[A-Z]{4}0[A-Z0-9]{6}",
        text
    )

    if match:
        return match.group()

    return ""

def get_accnt_no(cropped_img):

    img = preprocess_image(cropped_img)

    text = pytesseract.image_to_string(
        img,
        lang="eng",
        config="--psm 7 outputbase digits"
    )

    print("OCR Account:", text)

    numbers = re.findall(r"\d+", text)

    if numbers:
        return max(numbers, key=len)

    return ""

def get_cheque_number(cropped_img):

    img = preprocess_image(cropped_img)

    text = pytesseract.image_to_string(
        img,
        lang="mcr",
        config="--psm 7"
    )

    print("OCR Cheque:", text)

    numbers = re.findall(r"\d+", text)

    if numbers:
        return max(numbers, key=len)

    return ""

def get_amount(cropped_img):

    img = preprocess_image(cropped_img)

    text = pytesseract.image_to_string(
        img,
        lang="eng",
        config="--psm 7"
    )

    print("OCR Amount:", text)

    numbers = re.findall(r"\d+", text)

    if numbers:
        return "".join(numbers)

    return ""

def get_date(cropped_img):

    img = preprocess_image(cropped_img)

    text = pytesseract.image_to_string(
        img,
        lang="eng",
        config="--psm 7"
    )

    print("OCR Date:", text)

    numbers = re.findall(r"\d+", text)

    if numbers:
        return "".join(numbers)

    return ""

def get_bank_details(ifsc_code):

    if ifsc_code:
        
        url = f"https://ifsc.razorpay.com/{ifsc_code}"

        response = requests.get(url)

        if response.status_code==200:
            data = json.loads(response.content)
            df = pd.DataFrame([data])
        else:
            df = pd.DataFrame()
            df['IFSC'] = [ifsc_code]
        return df
    
    else:
        
        df = pd.DataFrame()
        df['IFSC'] = [ifsc_code]
        return df