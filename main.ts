const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TABLE_LENGTH: number = Math.min(canvas.width, canvas.height);
const PADDING: number = TABLE_LENGTH / 50;
const NUMBER_OF_CIRCLES: number = 5;
const CIRCLE_RADIUS: number = ((TABLE_LENGTH - (PADDING * (NUMBER_OF_CIRCLES + 2))) / (NUMBER_OF_CIRCLES + 1)) / 2;
const BASE_ANGLE_INCREMENT: number = Math.PI / 180;

const context: CanvasRenderingContext2D = canvas.getContext("2d")!;

interface Point {
    readonly x: number;
    readonly y: number;
}

class Circle {
    public readonly centerX: number;
    public readonly centerY: number;
    public readonly radius: number;
    public readonly angleIncrement: number;
    public readonly hue: number;
    public currentAngle: number = 0;

    public constructor(centerX: number, centerY: number, radius: number, angleIncrement: number, hue: number) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.angleIncrement = angleIncrement;
        this.hue = hue;
    }

    public get pointX(): number {
        return this.centerX + this.radius * Math.cos(this.currentAngle);
    }

    public get pointY(): number {
        return this.centerY + this.radius * Math.sin(this.currentAngle);
    }

    public render(): void {
        context.strokeStyle = `hsl(${this.hue}, 100%, 75%)`;
        context.lineWidth = this.radius / 20;
        context.beginPath();
        context.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = "white";
        context.beginPath();
        context.arc(this.pointX, this.pointY, this.radius / 10, 0, Math.PI * 2);
        context.fill();
    }

    public update(): void {
        this.currentAngle += this.angleIncrement;
    }
}

class LissajousCurveTable {
    private readonly horizontalAxisCircles: Circle[] = [];
    private readonly verticalAxisCircles: Circle[] = [];
    private readonly circleHues: number[] = [];
    private readonly points: Point[][][] = [];

    public constructor() {
        for (let i: number = 0; i < NUMBER_OF_CIRCLES; i += 1) {
            this.circleHues.push((360 / NUMBER_OF_CIRCLES) * i);
        }
        for (let i: number = 0; i < NUMBER_OF_CIRCLES; i += 1) {
            this.horizontalAxisCircles.push(
                new Circle(
                    ((i + 1) * (PADDING + (CIRCLE_RADIUS * 2))) + CIRCLE_RADIUS + PADDING,
                    PADDING + CIRCLE_RADIUS,
                    CIRCLE_RADIUS,
                    BASE_ANGLE_INCREMENT * (i + 1),
                    this.circleHues[i],
                ),
            );
            this.verticalAxisCircles.push(
                new Circle(
                    PADDING + CIRCLE_RADIUS,
                    ((i + 1) * (PADDING + (CIRCLE_RADIUS * 2))) + CIRCLE_RADIUS + PADDING,
                    CIRCLE_RADIUS,
                    BASE_ANGLE_INCREMENT * (i + 1),
                    this.circleHues[i],
                ),
            );
        }
        for (let i: number = 0; i < NUMBER_OF_CIRCLES; i += 1) {
            this.points[i] = [];
            for (let j: number = 0; j < NUMBER_OF_CIRCLES; j += 1) {
                this.points[i][j] = [];
            }
        }
    }

    public render(): void {
        for (const circle of this.horizontalAxisCircles) {
            circle.render();
        }
        for (const circle of this.verticalAxisCircles) {
            circle.render();
        }
        for (let i: number = 0; i < NUMBER_OF_CIRCLES; i += 1) {
            context.lineWidth = CIRCLE_RADIUS / 20;
            for (let j: number = 0; j < NUMBER_OF_CIRCLES; j += 1) {
                const pointX: number = this.horizontalAxisCircles[j].pointX;
                const pointY: number = this.verticalAxisCircles[i].pointY;
                this.points[i][j].push({ x: pointX, y: pointY });
                const averageHue: number = (this.horizontalAxisCircles[j].hue + this.verticalAxisCircles[i].hue) / 2;
                context.strokeStyle = `hsl(${averageHue}, 100%, 75%)`;
                for (let k: number = 0; k < this.points[i][j].length - 1; k += 1) {
                    context.beginPath();
                    context.moveTo(this.points[i][j][k].x, this.points[i][j][k].y);
                    context.lineTo(this.points[i][j][k + 1].x, this.points[i][j][k + 1].y);
                    context.stroke();
                    if (this.points[i][j].length > 361) {
                        this.points[i][j].shift();
                    }
                }
                context.beginPath();
                context.arc(
                    this.horizontalAxisCircles[j].pointX, this.verticalAxisCircles[i].pointY,
                    CIRCLE_RADIUS / 20, 0, Math.PI * 2,
                );
                context.fill();
            }
            context.strokeStyle = "white";
            context.lineWidth = 1;
            context.setLineDash([CIRCLE_RADIUS / 10, CIRCLE_RADIUS / 10]);
            const horizontalAxisCircle: Circle = this.horizontalAxisCircles[i];
            context.beginPath();
            context.moveTo(horizontalAxisCircle.pointX, horizontalAxisCircle.pointY);
            context.lineTo(horizontalAxisCircle.pointX, TABLE_LENGTH);
            context.stroke();
            const verticalAxisCircle: Circle = this.verticalAxisCircles[i];
            context.beginPath();
            context.moveTo(verticalAxisCircle.pointX, verticalAxisCircle.pointY);
            context.lineTo(TABLE_LENGTH, verticalAxisCircle.pointY);
            context.stroke();
            context.setLineDash([]);
        }
    }

    public update(): void {
        for (const circle of this.horizontalAxisCircles) {
            circle.update();
        }
        for (const circle of this.verticalAxisCircles) {
            circle.update();
        }
    }
}

const table: LissajousCurveTable = new LissajousCurveTable();

function animate(): void {
    context.fillStyle = "hsl(0, 0%, 20%)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    table.render();
    table.update();
    requestAnimationFrame(animate);
}

animate();
