import cv2 as cv

cap = cv.VideoCapture(0)

rostro = cv.CascadeClassifier('casiTodas.xml')

while True:
    ret, frame = cap.read()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    
    rostros = rostro.detectMultiScale(gray, 
    scaleFactor = 1.25, 
    minNeighbors = 130,
    minSize = (70, 78))

    for(x, y, w, h) in rostros:
        cv.rectangle(frame, (x,y), (x+w, y+h), (190, 170, 0), 2)
        cv.putText(frame, 'Detectado', (x,y-10), 2, 0.7, (190, 170, 0), 2, cv.LINE_AA)

    cv.imshow('frame', frame)

    k = cv.waitKey(1)
    if k == 27:
        break

cap.release()
cv.destroyAllWindows()