function CandidatureFiles(board)
{
    this.init(board);
}

CandidatureFiles.prototype = {

    board: null,
    form: null,

    init: function (board)
    {
        this.board = board;
        this.form = board.form;

        var t = this;

        $("#formActionManageAttachment").on("click", $.proxy(t.openAttachmentManager, t));
        $(".buttonRemoveFile").on("click", $.proxy(t.removeFile, t));
        $(".buttonCancelRemoveFile").on("click", $.proxy(t.cancelRemoveFile, t));

        if (!memoVars.isVisitor)
        {

            $(document).on('dragenter', '#mdAttachmentManager', function () {
                $("#fileDropZone").attr("class", "fileDragOver");
                return false;
            });

            $(document).on('dragover', '#mdAttachmentManager', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $("#fileDropZone").attr("class", "fileDragOver");
                return false;
            });

            $(document).on('dragleave', '#mdAttachmentManager', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $("#fileDropZone").attr("class", "");
                return false;
            });

            $(document).on('dragenter', '#createCandidatureForm', function (e) {
                e.preventDefault();
                e.stopPropagation();

                lBR.board.fileManager.formDragEnter();

                return false;
            });

            $(document).on('dragover', '#createCandidatureForm', function (e) {
                e.preventDefault();
                e.stopPropagation();

                lBR.board.fileManager.formDragOver();

                return false;
            });

            $(document).on('dragleave', '#createCandidatureForm', function (e) {
                e.preventDefault();
                e.stopPropagation();

                lBR.board.fileManager.formDragLeave();

                return false;
            });


            $(document).on('drop', '#mdAttachmentManager', $.proxy(t.uploadFile, t));

            $(document).on('drop', '#createCandidatureForm', $.proxy(t.dropFileOnForm, t));

            $("#fileDropZone").on("click", $.proxy(t.openFileInput, t));
            $("#importFileInput").on("change", $.proxy(t.uploadFile, t));
        }
    },

    openAttachmentManager : function () {
        $("#fileDropError").html("");
        $("#mdAttachmentManager").modal("show");
    },

    upload : function (files)
    {
        var f = files[0];

        var reader = new FileReader();

        // When the image is loaded,
        // run handleReaderLoad function
        this.currentFile = {name: f.name, type: f.type};

        reader.onload = this.handleReaderLoad;
        reader.onprogress = this.setFileReadingInProgress;
        reader.onloadend = this.setFileReadingDone;

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    },

    setFileReadingInProgress : function () {
        $("#fileDropZone").attr("class", "uploadInProgress");
    },

    setFileReadingDone : function () {
    },

    setFileUploadDone : function (timeOut) {
        $("#fileDropZone").attr("class", "uploadDone");

        setTimeout(function () {
            $("#fileDropZone").attr("class", "");
        }, timeOut);
    },

    handleReaderLoad : function (evt) {
        var pic = {};

        var f = lBR.board.fileManager.currentFile;
        pic.file = evt.target.result.split(',')[1];
        pic.name = f.name;
        pic.type = f.type;

        var str = jQuery.param(pic);
        str+="&csrf="+$("#csrf").val();

        if(lBR.board.fileManager.isFileOk(pic)) {
            $.ajax({
                type: 'POST',
                url: lBR.rootURL + '/attachments/file/' + lBR.board.selectedCandidature.id,
                data: str,
                success: function (response) {
                    lBR.board.fileManager.setFileUploadDone(1750);
                    if (response.result == "ok") {
                        toastr['success']("Fichier enregistré", "");
                        var a = new Attachment();
                        a.fileName = f.name;
                        a.type = f.type;
                        a.id = response.id;
                        lBR.board.fileManager.addFileToCandidature(a);
                    }
                    else {
                        lBR.manageError(response,"handleReaderLoad");
                        toastr['error']("Erreur lors de l'enregistrement du fichier", "Une erreur s'est produite " + response.msg);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    lBR.board.fileManager.setFileUploadDone(0);
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    toastr['error']("Erreur lors de l'enregistrement du fichier", "Une erreur s'est produite " + errorThrown);
                }
            });
        }
        else
            lBR.board.fileManager.setFileUploadDone(0);
    },

    isFileOk : function(f)
    {
        $("#fileDropError").html("");

        // extension
        var res = 1,
            re = /(\.|\/)(doc|docx|xls|xlsx|rtf|txt|csv|pdf|ppt|pptx|jpeg|jpg|png|gif|mp3|mp4|mkv|mpeg|mpg|wav|odt|bmp|tif|tiff|amr|odp|ods)$/i,
            err1 = "", err2 = "";

        if(!f.name.match(re))
        {
            err1 = "Ce type de fichier n'est pas autorisé sur MEMO<br /><br />";
            toastr['error'](err1,"Fichier non autorisé");
            res=0;
        }

        if(f.file.length>1398101)   // 4/3 de 1Mo pour en prendre l'encodage en base64
        {
            err2 = "Vous ne pouvez pas enregistrer des fichiers de plus de 1 Mo<br /><br />";
            toastr['error'](err2,"Fichier non autorisé");
            res=0;
        }

        if(!res)
            $("#fileDropError").html(err1+err2);

        return res;
    },

    showAttachments : function () {
        var c = lBR.board.selectedCandidature;

        var mdList = $("#mdFileList"),
            list = $("#fileList");
        mdList.html("");
        list.html("");
        list.hide();

        if (c) {
            if (c.attachments && c.attachments.length > 0) {
                for (i in c.attachments) {
                    var a = c.attachments[i];
                    mdList.append(this.buildFileIconListHTML(a));
                    list.append(this.buildFileIconHTML(a));

                    $('#mdFileList .tooltipster,#fileList .tooltipster').tooltipster({
                        theme: 'tooltipster-borderless',
                        debug: false,
                        delay: 100
                    });

                    this.addEventsToFile(a);
                }
                list.show();
            }
        }
    },

    addFileToCandidature : function (att) {
        var c = lBR.board.selectedCandidature;

        c.attachments = c.attachments || [];
        c.attachments.push(att);

        var mdList = $("#mdFileList"),
            list = $("#fileList");

        list.append(this.buildFileIconHTML(att));
        mdList.append(this.buildFileIconListHTML(att));

        $('#mdFileList .tooltipster,#fileList .tooltipster').tooltipster({
            theme: 'tooltipster-borderless',
            debug: false,
            delay: 100
        });

        this.addEventsToFile(att);

        if (c.attachments.length == 1)
            list.show();
    },

    addEventsToFile : function (att) {
        $("#fileRemove_" + att.id).on("click", $.proxy(this.openRemoveFileConfirm, this));
        $("#file_" + att.id + ",#mdFile_" + att.id).on("click", $.proxy(this.openFile, this));
    },

    buildFileIconHTML : function (att) {
        var h = "<div class='tooltipster' id='file_" + att.id + "' rel='" + att.id + "' title='Cliquez pour ouvrir le fichier'><img src='./pic/logos/fileTypes/",
            ty = att.type;

        h += this.getFileTypeIcon(ty, att.fileName);

        h += "' /> " + att.fileName;

        return h;
    },

    buildFileIconListHTML : function (att) {
        var h = "<div><span id='mdFile_" + att.id + "' class='tooltipster' rel='" + att.id + "' title='Cliquez pour ouvrir le fichier'><img src='./pic/logos/fileTypes/",
            ty = att.type;

        h += this.getFileTypeIcon(ty, att.fileName);

        h += "' /> " + att.fileName + "</span> <i id='fileRemove_" + att.id + "' class='fa fa-remove tooltipster'  rel='" + att.id + "' title='Supprimer ce fichier'></i>";

        return h;
    },

    getFileTypeIcon : function (type, name) {
        var f = "file.svg",
            ty = type.toLowerCase(),
            n = name.toLowerCase();

        if (ty.indexOf("png") > -1)
            f = "png.svg";
        else if (ty.indexOf("msword") > -1)
            f = "doc.svg";
        else if (n.endsWith(".pdf"))
            f = "pdf.svg";
        else if (n.endsWith(".rtf"))
            f = "rtf.svg";
        else if (n.endsWith(".txt"))
            f = "txt.svg";
        else if (n.endsWith(".xls"))
            f = "xls.svg";
        else if (n.endsWith(".xlsx"))
            f = "xls.svg";
        else if (n.endsWith(".jpeg"))
            f = "jpg.svg";
        else if (n.endsWith(".jpg"))
            f = "jpg.svg";
        else if (n.endsWith(".gif"))
            f = "gif.svg";
        else if (n.endsWith(".mp3"))
            f = "mp3.svg";
        else if (n.endsWith(".mp4"))
            f = "mp4.svg";

        return f;
    },

    openRemoveFileConfirm : function (evt) {
        this.currentFileId = null;
        evt.preventDefault();
        evt.stopPropagation();

        this.currentFileId = evt.currentTarget.attributes['rel'].value;

        $("#mdAttachmentManager").modal("hide");
        $("#mdRemoveFile").modal({backdrop: "static"});

    },

    removeFile : function () {
        $("#mdRemoveFile").modal("hide");
        $("#mdAttachmentManager").modal("show");

        var fId = this.currentFileId,
            cId = this.board.selectedCandidature.id,
            p = "csrf="+$("#csrf").val();

        $.ajax({
            type: 'DELETE',
            url: lBR.rootURL + '/attachments/file/' + cId + '/' + fId,
            data : p,
            dataType: "json",

            success: function (response) {
                if (response.result == "ok") {
                    toastr['success']("Pièce jointe supprimée", "");
                }
                else {
                    lBR.manageError(response,"removeFile");
                    toastr['error']("Erreur lors de la suppression de la pièce jointe", "Une erreur s'est produite " + response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                toastr['error']("Erreur lors de la suppression de la pièce jointe", "Une erreur s'est produite " + errorThrown);
            }
        });

        this.removeFileFromClient(fId);
    },

    cancelRemoveFile : function () {
        $("#mdRemoveFile").modal("hide");
        $("#mdAttachmentManager").modal("show");
    },

    removeFileFromClient : function (fId) {
        $("#mdFile_" + fId).parent().remove();
        $("#file_" + fId).remove();

        this.board.selectedCandidature.attachments = jQuery.grep(this.board.selectedCandidature.attachments, function (att) {
            return att.id != fId;
        });
    },

    openFile : function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var fId = evt.currentTarget.attributes['rel'].value,
            fileUrl = lBR.rootURL + "/attachments/file/" + fId;

        if(memoVars.visitorLink)
            fileUrl += "?link=" + memoVars.visitorLink;

        window.open(fileUrl);
    },

    openFileInput : function (evt) {
        $('#importFileInput').trigger('click');
    },

    uploadFile : function (e) {
        if (e.type == "change") {
            this.setFileReadingInProgress();
            var target = e.originalEvent.originalTarget || e.originalEvent.target;
            this.upload(target.files);
        }
        else if (e.originalEvent.dataTransfer) {
            if (e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                this.setFileReadingInProgress();
                this.upload(e.originalEvent.dataTransfer.files);
            }
        }
        else {
            $("#fileDropZone").attr("class", "");
        }
        return false;
    },

    formDragEnter : function()
    {
        var c = this.board.selectedCandidature;
        if(c)
        {
            this.showUploadOnForm();
        }
    },

    formDragOver : function()
    {
        var c = this.board.selectedCandidature;
        if(c)
        {
            this.showUploadOnForm();
        }
    },

    formDragLeave : function()
    {
        var c = this.board.selectedCandidature;
        if(c)
        {
            this.hideUploadOnForm();
        }
    },

    showUploadOnForm : function()
    {
        $("#uploadFileOnFormInfo").show();
    },

    hideUploadOnForm : function()
    {
        $("#uploadFileOnFormInfo").hide();
    },

    dropFileOnForm : function(e)
    {
        var c = this.board.selectedCandidature;

        if(c)
        {
            this.hideUploadOnForm();
            this.uploadFile(e);
        }
    }

}