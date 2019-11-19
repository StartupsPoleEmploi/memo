import React, { Component } from 'react'
import uploadBackgroundImage from '../pic/uploadBackground.png';

class FileDrop extends Component {
  
    state = {
        drag: false
    }

    dragCounter = 0;

    dropRef = React.createRef();
    
    handleDrag = (e) => 
    {
        e.preventDefault()
        e.stopPropagation()
    }

    handleDragIn = (e) => 
    {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;

        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) 
        {
            this.setState({drag: true})
        }
    }

    handleDragOut = (e) => 
    {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter--;

        if (this.dragCounter === 0) 
        {
            this.setState({drag: false});
        }
    }

    handleDrop = (e) => 
    {
        e.preventDefault();
        e.stopPropagation();
        this.setState({drag: false});

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) 
        {
            this.props.handleDrop(e.dataTransfer.files);
            try
            {
                e.dataTransfer.clearData();
            }
            catch(err){}
            this.dragCounter = 0;
        }
    }

    componentDidMount() 
    {
        let div = this.dropRef.current;
        div.addEventListener('dragenter', this.handleDragIn);
        div.addEventListener('dragleave', this.handleDragOut);
        div.addEventListener('dragover', this.handleDrag);
        div.addEventListener('drop', this.handleDrop);
    }

    componentWillUnmount() 
    {
        let div = this.dropRef.current;
        div.removeEventListener('dragenter', this.handleDragIn);
        div.removeEventListener('dragleave', this.handleDragOut);
        div.removeEventListener('dragover', this.handleDrag);
        div.removeEventListener('drop', this.handleDrop);
    }

    render() 
    {
        return (
            <div
                ref={this.dropRef}
            >
                {this.state.drag &&
                <div className='fileUploadOverlay'>
                    <div className='fileUploadText'>
                        <img src={uploadBackgroundImage} alt=''/>
                        <div>Glissez le fichier sur la fiche candidature pour l'ajouter dans MEMO</div>
                    </div>
                </div>
                }
                {this.props.children}
            </div>
        )
    }
}
export default FileDrop

/*
#uploadFileOnFormInfo
{
    left:50%;
    transform: translate(-50%,0);
    top:50px;
    position: fixed;
    height: 150px;
    width: 75%;
    max-width: 400px;
    background: #eee;
    z-index: 10000;
    border-radius: 5px !important;
    border: 3px dashed #00C7FC;
    color: #aaa;
    font-size: 20px;
    text-align: center;
    padding: 20px;
}
*/