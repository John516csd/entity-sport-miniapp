declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
} 