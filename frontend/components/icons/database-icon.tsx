interface Props {
    size?: number;
    fill?: string;
    width?: number;
    height?: number;
    color?: string;
}

export const DatabaseIcon = ({ fill, size, height, width, color, ...props }: Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width ?? 32} height={height ?? 32} color={color ?? "#000000"} fill={"none"}>
            <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 12C20 13.6569 16.4183 15 12 15C7.58172 15 4 13.6569 4 12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 5V19C20 20.6569 16.4183 22 12 22C7.58172 22 4 20.6569 4 19V5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 15V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>);
}