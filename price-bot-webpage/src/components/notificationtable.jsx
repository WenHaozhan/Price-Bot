import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InsertNotificationRow from './insertnotificationrow'
import NotificationTableSaveButton from "./notificationtablesavebutton";
export default function NotificationTable(props) {
    const [data, setData] = useState([]);
    const [update, setUpdate] = useState(false);
    const {userid, channelid} = useParams();
    // const [searchParams, setSearchParams] = useSearchParams();
    async function fetchData () {
        try {
            let res = await fetch(`${process.env.REACT_APP_INTERNAL_API_ENDPOINT}/notifications/${userid}`, {
                mode: "cors"
            });
            let json = await res.json();
            // console.log(json);
            setData(json);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => fetchData, [update]);

    function deleteNotif(e) {
        e.preventDefault();
        let b = confirm("Click OK to confirm deletion");
        if (b) {
            fetch(`${process.env.REACT_APP_INTERNAL_API_ENDPOINT}/notifications/${userid}/${e.target.getAttribute('notifid')}`, {
                method: "delete",
            }).then((res) => {
                setUpdate((prev) => {return !prev;});
            }).catch((rej) => {console.log(rej)});
        }
    }

    function updateNotif(e) {
        e.preventDefault();
        let input = document.evaluate(`//input[@notifid='${e.target.getAttribute('notifid')}' and @type='number' and @name='price']`,
            document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue;
        fetch(`${process.env.REACT_APP_INTERNAL_API_ENDPOINT}/notifications/${userid}/${e.target.getAttribute('notifid')}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                price: input.value
            })
        }).then((res) => {
            setUpdate((prev) => {return !prev;});
        }).catch((rej) => {console.log(rej)});
    }

    function priceChange(e) {
        console.log(e.target.value);
        e.target.textContext = e.target.value;
    }

    return (
    <div>
        <form>
            <table>
                <thead>
                    <tr>
                        <th>Website</th>
                        <th>url</th>
                        <th>Price</th>
                        <th/>
                        <th/>
                    </tr>
                </thead>
                
                <tbody>
                    {
                        data.map((row, index) => {
                            let url = new URL(row.url);

                            return (
                            <tr key={row.id}>
                                <td>{url.host}</td>
                                <td><a href={url.href}>{url.href}</a></td>
                                <td><input type="number" placeholder="Enter Price" defaultValue={row.price} name="price" min={0} notifid={row.id}></input></td>
                                <td><input type="button" value="Delete" notifid={row.id} onClick={deleteNotif}></input></td>
                                <td><input type="button" value="Save" notifid={row.id} onClick={updateNotif}></input></td>
                            </tr>);
                        })
                    }
                    <InsertNotificationRow userid={userid} channelid={channelid} callback={setUpdate}/>
                </tbody>
            </table>
        </form>
    </div>);
}