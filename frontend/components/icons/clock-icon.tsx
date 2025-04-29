interface Props {
    size?: number;
    fill?: string;
    width?: number;
    height?: number;
    color?: string;
}


export const ClockIcon = ({ fill, size, height, width, color, ...props }: Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width ?? 32} height={height ?? 32} color={color ?? "#000000"} fill={"none"}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>)
}
