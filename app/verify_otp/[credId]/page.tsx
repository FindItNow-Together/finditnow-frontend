import VerifyOtp from "./VerifyOtp";

type Params = Promise<{ credId: string }>
export default async function Page({params}: { params: Params }) {
    const {credId} = await params;
    return <VerifyOtp credId={credId}/>;
}