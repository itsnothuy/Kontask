interface Props {
    size?: number;
    fill?: string;
    width?: number;
    height?: number;
    color?: string;
}


export const GlobeIcon = ({ fill, size, height, width, color, ...props }: Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width ?? 32} height={height ?? 32} color={color ?? "#000000"} fill={"none"}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M21 15H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 9H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>)
}
