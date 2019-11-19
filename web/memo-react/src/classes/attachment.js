import { $sc } from '../components/utils';

class Attachment {

    getIcon()
    {
        let res = "fal fa-file",
            ty = this.type.toLowerCase(),
            n = this.fileName.toLowerCase();
        
        if (ty.indexOf("png") > -1)
            res =  "fal fa-file-image";
        else if (ty.indexOf("msword") > -1)
            res =  "fal fa-file-word";
        else if (n.endsWith(".pdf"))
            res =  "fal fa-file-pdf";
        else if (n.endsWith(".rtf"))
            res =  "fal fa-file-word"; 
        else if (n.endsWith(".xls"))
            res =  "fal fa-file-excel";
        else if (n.endsWith(".xlsx"))
            res =  "fal fa-file-excel";
        else if (n.endsWith(".jpeg"))
            res =  "fal fa-file-image";
        else if (n.endsWith(".jpg"))
            res =  "fal fa-file-image";
        else if (n.endsWith(".gif"))
            res =  "fal fa-file-image";
        else if (n.endsWith(".mp3"))
            res =  "fal fa-file-audio";
        else if (n.endsWith(".mp4"))
            res =  "fal fa-file-video";

        return res;
    }

    constructor(attachment)
    {
        if(attachment)
        {
            Object.assign(this,attachment);

            if(attachment.fileName)
                this.fileName = $sc(this.fileName);
            if(attachment.type)
                this.type = $sc(this.type);
        }
    }
}
export default Attachment;