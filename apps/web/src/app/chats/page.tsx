import {redirect} from "next/navigation";

const Page = async () => {
    return redirect('/chats/new');
};

export default Page;