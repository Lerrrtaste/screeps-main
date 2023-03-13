import * as React from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

/* import {ScreepsAPI} from 'screeps-api'; */

/* interface Item {
 *     name: string;
 *     first_name: string;
 *     id: number;
 * } */
export default function CreepList() {
    /* const [error, setError] = React.useState(null);
     * const [isLoaded, setIsLoaded] = React.useState(false);
     * const [items, setItems] = React.useState([] as Item[]); */

    /*
     *     React.useEffect(() => {
     *         api.memory.get()
     *             .then(res => res.json())
     *             .then(
     *                 (result) => {
     *                     setIsLoaded(true);
     *                     setItems(result.data);
     *                 },
     *                 (error) => {
     *                     setIsLoaded(true);
     *                     setError(error);
     *                 }
     *             )
     *     }, [])
     *     if (error) {
     *         console.log(error);
     *         return <div>Error</div>;
     *     } else if (!isLoaded) {
     *         return <div>Loading...</div>;
     *     } else {
     *         return (
     *             <ul>
     *                 {items.map(item => (
     *                     <li key={item.id}>
     *                         {item.first_name}
     *                     </li>
     *                 ))}
     *             </ul>
     *         );
     *     }
     *  */
    return (
        <div className="CreepsList">
            <h1>Creeps List</h1>
            <List>
                <ListItem>
                    <ListItemButton>
                        <ListItemText primary="Creep 1" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    {"an item"}
                </ListItem>
                <ListItem>
                    {"an item"}
                </ListItem>
                <ListItem>
                    {"an item"}
                </ListItem>
            </List>


            <Button variant="contained"> HI </Button>
        </div>
    );
}
