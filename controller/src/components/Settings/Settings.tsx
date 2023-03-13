import React, { ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { authActions } from '../../redux/auth/slice';
import Button from '@mui/material/Button';

const Settings: React.FC = () => {
    const dispatch = useAppDispatch();

    const [inputToken, setInputToken] = React.useState("");
    const [showTokenUnlock, setShowTokenUnlock] = React.useState(false);

    const token = useAppSelector((state) => state.auth.token);

    const handleSetToken = (): void => {
        dispatch(authActions.setToken(inputToken));
    }

    const handleResetToken = (): void => {
        dispatch(authActions.setToken(undefined));
    }

    const onTokenInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setInputToken(event.target.value);
        console.log(inputToken);
    };

    const handleToggleShowUnlockFrame = (): void => {
        setShowTokenUnlock(!showTokenUnlock);
    }

    return (
        <div>
            <h1>Settings</h1>
            <h2>Authentication</h2>
            <input
                onChange={onTokenInputChange}
                value={token ?? inputToken}
                disabled={typeof token === 'string'}
                placeholder={"Enter API Token"} />
            {typeof token === 'string' ?
                <Button
                    variant={'contained'}
                    onClick={handleResetToken}
                >
                    Logout
                </Button>
                :
                <Button
                    variant={'contained'}
                    onClick={handleSetToken}
                >
                    Login
                </Button>
            }
            <div>
                <button onClick={handleToggleShowUnlockFrame}>{showTokenUnlock ? "Close" : "Unlock Rate Limit"}</button>
                {typeof token === 'string' && showTokenUnlock ?
                    <iframe src={`https://screeps.com/a/#!/account/auth-tokens/noratelimit?token=${token}`} />
                    : null
                }
            </div>
        </div>
    );

};

export default Settings;
