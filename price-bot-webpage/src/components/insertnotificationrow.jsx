
export default function InsertNotificationRow(props) {
    function addNotif(e) {
        e.preventDefault();
        const url = document.getElementById("addUrlInput").value;
        const price = document.getElementById("addPriceInput").value;
        try {
            let urlObj = new URL(url);
        } catch (e) {
            console.log(e);
            alert("Please enter a valid URL");
            return;
        }
        
        if (price === '') {
            alert("Please enter a valid price");
            return;
        }
        fetch(`${process.env.REACT_APP_INTERNAL_API_ENDPOINT}/notifications/${props.userid}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                'channelid': props.channelid,
                'url': url,
                'price': price,
                'comparison': 'less than'
            })
        }).then((res) => {
            document.getElementById("addUrlInput").value = '';
            document.getElementById("addPriceInput").value = '';
            props.callback((prev)=>{return !prev;});
        }).catch((e) => console.log(e));
    }
    
    return (
        <tr>
            <td></td>
            <td><input id="addUrlInput" className="urlTextBox" type="url" placeholder="Enter item URL" name="url" ></input></td>
            <td><input id="addPriceInput" type="number" placeholder="Enter price" name="price" min={0}></input></td>
            <td><input type="button" value="Add" onClick={addNotif}></input></td>
        </tr>

    )
}

