import React from 'react';
import Tooltip from '@mui/material/Tooltip';

const SmartTooltip = ({ title, disabled, children, ...props }) => {
    return (
        <Tooltip
            title={disabled ? title : ""}
            placement="top"
            arrow
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, -8],
                            },
                        },
                    ],
                },
            }}
            {...props}
        >
            <span>
                {React.cloneElement(children, { disabled: disabled || children.props.disabled })}
            </span>
        </Tooltip>
    );
};

export default SmartTooltip;
