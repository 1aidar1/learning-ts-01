
export function getRGBA(value :number) :string{
    const alpha = Math.abs(value);
    const R = value<0?0:255;
    const G = R;
    const B = value>0?0:255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}