export class CustomError {
  statusCode: number;
  message: any;

  constructor(
    statusCode: number = 500,
    message: any = "Internal Server Error",
  ) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
