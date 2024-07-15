import tkinter as tk
from tkinter import filedialog 
from face_cropper import crop_face
import pandas as pd
import xlrd
import os
from PIL import Image, ImageTk
import cv2
import argparse



def Main(args):

    cap = cv2.VideoCapture(args.camID)
    # cap = cv2.VideoCapture(0)

    def display_students(class_name):
        for widget in students_frame.winfo_children():
            widget.destroy()

        row = 0
        col = 0

        for student in classes[class_name]:
            student_name =  student[3]+" "+student[4] 
            button = tk.Button(students_frame, text=student_name, width=15, height=3, command=lambda s=student: open_student_window(s), font=("Helvetica", 30))
            button.grid(row=row, column=col)

            col += 1
            if col > 4:
                col = 0
                row += 1

    def copy_and_rename(src_path, dest_path, new_name):
        full_dest_path = os.path.join(dest_path, new_name)

        with open(src_path, 'rb') as file:
            content = file.read()

        with open(full_dest_path, 'wb') as file:
            file.write(content)

        print(f"File copied from {src_path} to {full_dest_path}")

    def open_student_window(student_data):


        global ai_cropping_enabled
        ai_cropping_enabled = tk.BooleanVar()
        ai_cropping_enabled.set(True)  # 初始化為開啟狀態

        def show_frame():
            if not is_captured:
                _, frame = cap.read()
                frame = cv2.flip(frame, 1)
                
                if ai_cropping_enabled.get():
                    cv2image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)
                else:
                    height, width, _ = frame.shape
                    new_width = int(height * 5 / 6)
                    cropped_frame = frame[:, (width - new_width) // 2 : (width + new_width) // 2, :]
                    cv2image = cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2RGBA)
            else:
                try:
                    captured_image = cv2.imread(f"save\\done\\{student_data[6]}.png")
                except:
                    captured_image = cv2.imread(f"save\\done\\{student_data[6]}.png")

                cv2image = cv2.cvtColor(captured_image, cv2.COLOR_BGR2RGBA)

            img = Image.fromarray(cv2image)
            imgtk = ImageTk.PhotoImage(image=img)
            lmain.imgtk = imgtk
            lmain.configure(image=imgtk)
            lmain.after(10, show_frame)


        def capture_image():
            
            global is_captured
            if not os.path.exists('save\\original'):
                os.makedirs('save\\original')

            filename = f"save\\original\\{student_data[0]}-{student_data[2]}-{student_data[3]}.png"
            _, frame = cap.read()
            cv2.imwrite(str(filename), frame)

            if not os.path.exists('save//done'):
                os.makedirs('save//done')
            if not os.path.exists('save//check'):
                os.makedirs('save//check')

            save_path = f"save\\done\\{student_data[6]}.png"

            if ai_cropping_enabled.get():

                result = crop_face(filename, save_path , "haarcascade_frontalface_default.xml", 1.3, 55)

                if result == "Success":
                    print("Success")
                    is_captured = True
                    button_action.config(text="確認儲存", width=10, height=2, command=confirm_and_close, font=("Helvetica", 30))
                    button_retry.pack()
                elif result == "Failed":
                    print("Failed")
                    # copy_and_rename(filename,"save//done", f"{student_data[6]}.png")
                    # is_captured = True
                    # button_action.config(text="確認儲存", width=10, height=2, command=confirm_and_close, font=("Helvetica", 30))
                    # button_retry.pack()

            else:

                crop_photo(filename,"save//done", f"{student_data[6]}.png")    

                is_captured = True
                button_action.config(text="確認儲存", width=10, height=2, command=confirm_and_close, font=("Helvetica", 30))
                button_retry.pack()
                
            copy_and_rename(save_path, "save//check" , f"{student_data[2]}-{student_data[3]}-{student_data[4]}.png")


        def crop_photo(input_path, output_path, output_filename):

            frame = cv2.imread(input_path)
            height, width, _ = frame.shape
            new_width = int(height * 5 / 6)
            cropped_frame = frame[:, (width - new_width) // 2 : (width + new_width) // 2, :]
            output_file_path = f"{output_path}/{output_filename}"
            cv2.imwrite(output_file_path, cropped_frame)

        def confirm_and_close():
            cv2.destroyAllWindows()
            new_window.destroy()

        def retry_capture():
            global is_captured
            is_captured = False
            button_action.config(text="拍照", width=10, height=2, command=capture_image, font=("Helvetica", 30))
            button_retry.pack_forget()

        def exit_student_window():
            global is_captured
            is_captured = False
            cv2.destroyAllWindows()  # 關閉 OpenCV 窗口
            new_window.destroy()  # 關閉拍照界面的視窗

        global is_captured
        is_captured = False

        

        new_window = tk.Toplevel(app)
        new_window.title("Student Details")
        new_window.geometry("1920x1080")

        lmain = tk.Label(new_window)
        lmain.pack()

        ai_cropping_checkbox = tk.Checkbutton(new_window, text="開啟AI裁切", variable=ai_cropping_enabled, font=("Helvetica", 30))
        ai_cropping_checkbox.pack()

        button_frame = tk.Frame(new_window)  # 創建一個 Frame 放置按鈕
        button_frame.pack()

        button_action = tk.Button(button_frame, text="拍照", width=10, height=2, command=capture_image, font=("Helvetica", 30))
        button_action.pack(side=tk.LEFT)

        button_retry = tk.Button(new_window, text="重新拍攝", width=10, height=2, command=retry_capture, font=("Helvetica", 30))

        button_exit = tk.Button(button_frame, text="退出", width=10, height=2, command=exit_student_window, font=("Helvetica", 30))
        button_exit.pack(side=tk.LEFT)

        details_frame = tk.Frame(new_window)
        details_frame.pack()

        for detail in student_data:
            tk.Label(details_frame, text=detail, font=("Helvetica", 25)).pack(side=tk.LEFT)

        show_frame()

        new_window.protocol("WM_DELETE_WINDOW", lambda: [ cv2.destroyAllWindows(), new_window.destroy()])


    def load_excel():
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xls;*.xlsx")])
        if not file_path:
            return

        if file_path.endswith('.xls'):
            book = xlrd.open_workbook(file_path)
            sheet = book.sheet_by_index(0)
            raw_data = [[sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)]
        else:
            df = pd.read_excel(file_path, engine='openpyxl')
            raw_data = df.values.tolist()

        for student in raw_data[1:]:
            class_name = student[2] 
            if class_name not in classes:
                classes[class_name] = []
                button = tk.Button(buttons_frame, text=class_name,font=("Helvetica", 25), command=lambda c=class_name: display_students(c))
                button.pack(side=tk.LEFT)
            classes[class_name].append(student)





    app = tk.Tk()
    app.title("Class Selection")
    app.geometry("1920x1080")

    load_excel_button = tk.Button(app, text="Load Excel", command=load_excel)
    load_excel_button.pack()

    buttons_frame = tk.Frame(app)
    buttons_frame.pack()

    students_frame = tk.Frame(app)
    students_frame.pack()

    classes = {}


    app.mainloop()

settings_window = None

def setup():

    def open_settings_window():
        global settings_window
        settings_window = tk.Toplevel(app)
        settings_window.title("設定")
        settings_window.geometry("400x200")
        confirm_button = tk.Button(settings_window, text="確認", command=close_settings_window)
        confirm_button.pack()

    def close_settings_window():
        global settings_window
        settings_window.destroy()
        app.after(100, Main) 

    app = tk.Tk()
    app.withdraw()
    open_settings_window()
    app.wait_window(settings_window)
    app.mainloop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Crop a face from an image')
    parser.add_argument('camID', type=int, help='enter the camera ID')
    args = parser.parse_args()
    Main(args)


# Main(0)