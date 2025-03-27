# WhatsApp Message Scheduler

This is a Flask-based web application that allows users to schedule WhatsApp messages to be sent at a specified time using the `pywhatkit` library.

## Features

- Schedule WhatsApp messages to be sent automatically.
- Simple web interface for entering phone numbers, messages, and scheduling time.
- Uses `pywhatkit` to send messages instantly.

## Requirements

Make sure you have the following installed:

- Python 3.x
- Flask
- pywhatkit

## Installation

1. Clone this repository or download the source code:

   ```bash
   git clone https://github.com/your-repository.git
   cd your-repository
   ```

2. Install the required dependencies:

   ```bash
   pip install flask pywhatkit
   ```

## Usage

1. Run the Flask application:

   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:

   ```
   http://127.0.0.1:5000/
   ```

3. Enter the phone number, message, and scheduled time in `HH:MM` format, then submit the form.

## API Endpoint

### Schedule a Message

- **Endpoint:** `/schedule`
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "phone": "+1234567890",
    "message": "Hello, this is a test message!",
    "time": "15:30"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Message sent successfully!"
  }
  ```

## Notes

- The application waits until the scheduled time before sending the message.
- The delay is calculated to ensure the message is sent on time.
- The scheduled time should be in the future, or an error will be returned.
- The `tab_close=True` parameter ensures the WhatsApp Web tab closes after sending the message.

## Troubleshooting

- If the message is not being sent, ensure you are logged into WhatsApp Web on your default browser.
- The application needs to keep running until the scheduled message is sent.
- If an error occurs, check the console logs for more details.

##
