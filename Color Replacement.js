let { Image } = require(`image-js`)

let Outline_Color = [120, 130, 140, 255]

let Outline_Sum = Outline_Color.reduce((A, B) => A + B)

let Old_Color = [128, 128, 128, 255]

let Old_Sum = Old_Color.reduce((A, B) => A + B)

let New_Color = [255, 255, 255, 255]

function Distance(X, Y) {
    return Math.sqrt(X.reduce((A, _, I) => A + (X[I] - Y[I]) ** 2, 0))
}

function Level_Distance(X) {
    let Sum = X.reduce((A, B) => A + B)
    return (Distance(Multiply(Sum / Old_Sum, Old_Color), X) + Distance(Multiply(Sum / Outline_Sum, Outline_Color), X)) * (0.75 + 10 / (1 + Distance(X, [233, 233, 245, 255]) ** 0.001 + Distance(X, [255, 255, 255, 255]) ** 0.001))
}

function Multiply(A, B) {
    return B.map(X => A * X)
}

function Add(A, B) {
    return A.map((X, I) => X + B[I])
}

function Approximate_Replacement(I) {
    for (let X = 0; X < I.width; X++) for (let Y = 0; Y < I.height; Y++) {
        let Color = I.getPixelXY(X, Y)
        let Lambda = 1 / (1 + 0.00000007 * Level_Distance(Color, Old_Color) ** 3)
        Color = Add(Multiply(Lambda, New_Color), Multiply((1 - Lambda), Color))
        I.setPixelXY(X, Y, Color)
    }
    return I
}

function Crop_Green(I) {
    for (let X = 0; X < I.width; X++) for (let Y = 0; Y < I.height; Y++) {
        let Color = I.getPixelXY(X, Y)
        let Lambda = (Color[1] / (Color[0] + Color[1] + Color[2])) ** 4
        if (Lambda > 0) {
            Color = Add(Multiply(Lambda, New_Color), Multiply((1 - Lambda), Color))
            if (Color[3] <= 250) {
                I.setPixelXY(X, Y, New_Color)
            } else I.setPixelXY(X, Y, Color)
        }
    }
    return I
}

function Literal_Replacement(I) {
    for (let X = 0; X < I.width; X++) for (let Y = 0; Y < I.height; Y++) {
        let Color = I.getPixelXY(X, Y)
        let Lambda = Distance(Color, Old_Color) < 150
        if (Lambda > 0) {
            Color = Add(Multiply(Lambda, New_Color), Multiply((1 - Lambda), Color))
            I.setPixelXY(X, Y, Color)
        }
    }
    return I
}

async function Main() {
    let I = await Image.load(`Old File.png`)
    Literal_Replacement(I).save(`./New File.png`)
}
Main()