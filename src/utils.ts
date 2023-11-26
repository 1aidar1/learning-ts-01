
export function lerp(A: number, B: number, t :number) :number{
    return A+(B-A)*t;
}

export type Coordinates = {
    x: number;
    y: number;
};

export type CoordinatePair = {
    start: Coordinates;
    end: Coordinates;
}

export type Polygon = {
    vertices: Coordinates[];
}




export function pairToCoordinatesArray(a: CoordinatePair) :Coordinates[]{
    let out: Coordinates[] = [];
    out.push(a.start)
    out.push(a.end)
    return out
}

export function getIntersection(A: Coordinates,B: Coordinates,C: Coordinates,D: Coordinates){
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);

    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B. y,t),
                offset:t
            }
        }
    }

    return null;
}

export function polyIntersect(A: Coordinates[],B: Coordinates[]) : boolean{
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B.length; j++) {
            const touch = getIntersection(
                A[i],
                A[(i+1)%A.length],
                B[j],
                B[(j+1)%B.length]
            );
            if (touch){
                return true;
            }
        }
    }
    return false;
}