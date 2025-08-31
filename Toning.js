let { Image } = require(`image-js`)

let File_System = require(`fs`)

let True = [255, 128, 0]

//let True_Mean = True.reduce((A, B) => A + B) / True.length

let True_Sum = True.reduce((A, B) => A + B)

let Averages = File_System.existsSync(`Averages.json`) ? JSON.parse(File_System.readFileSync(`Averages.json`)) : {}

let Lambdas = []

function Convert(Color) {
    //let C = True.map((X, I) => X / Color[I])
    let Sum = Color.reduce((A, B) => A + B)
    //let Mean = C.reduce((A, B) => A + B) / C.length
    let Distances = 0
    for (let Index = 0; Index < 3; Index++) Distances += Math.sqrt((True[0] - Color[0] / Color[Index] * True[Index]) ** 2 + (True[1] - Color[1] / Color[Index] * True[Index]) ** 2 + (True[2] - Color[2] / Color[Index] * True[Index]) ** 2)
    //let Level_Distance = C.reduce((A, B, I) => Math.max(A, Math.abs(B / Mean - True[I] / True_Mean)), 0)
    let Euclidean_Distance = Math.sqrt((True[0] * Sum / True_Sum - Color[0]) ** 2 + (True[1] * Sum / True_Sum - Color[1]) ** 2 + (True[2] * Sum / True_Sum - Color[2]) ** 2)
    Lambdas.push(Sum / True_Sum)
    return Euclidean_Distance // Here, we implement a few ideas for how to determine distance.
}

async function Main() {

    let Center = [64, 64] // This is the point at which we'd be calculating the averages.
    let Maximum_Radius = 5 // This is the radius of the circle that determines the usable area for calculating the average.
    let Angles = 90 // This is how "finely" we want to search the image.

    let Files = File_System.readdirSync(`Path`).filter(X => true).sort() // Here, we'd use an actual filter instead of X => true. Sorting just helps us ensure that the order in Averages matches the order by which we want to sort the files.
    console.log(Files.length - 1)
    Averages = []
    for (let F of Files) {
        let I = await Image.load(`Path/${F}`)
        let Average = [0, 0, 0]
        for (let Angle = 0; Angle < Angles; Angle++) for (let Radius = 0; Radius < Maximum_Radius; Radius++) {

            let X = Radius * Math.sin(Angle / Angles * 2 * Math.PI)
            let Y = Radius * Math.cos(Angle / Angles * 2 * Math.PI)

            let Value = I.getPixelXY(Math.round(Center[0] + X), Math.round(Center[1] + Y))

            Average[0] += Value[0]
            Average[1] += Value[1]
            Average[2] += Value[2]
        }
        Average = Average.map(X => X / (Angles * Maximum_Radius))

        Averages.push(Average)
    }
    File_System.writeFileSync(`Averages.json`, JSON.stringify(Averages)) // Calculating the averages is expensive, so we cache it.
    for (let I of Averages.map((X, I) => [I, X]).sort((A, B) => Convert(A[1]) - Convert(B[1]))) console.log(`${I[0]}: (${Convert(I[1])}, ${Lambdas[I[0]]})`) // This gives us the tone distance (first part) and the lighting distance (second part).
}
Main()