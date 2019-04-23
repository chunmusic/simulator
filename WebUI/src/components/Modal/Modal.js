import React from 'react'
import PropTypes from 'prop-types'
import FloatingLayer from '../FloatingLayer/FloatingLayer';

import css from './Modal.module.less';
console.log(css.modalContent)
class Modal extends React.Component {
    static propTypes = {
        open: PropTypes.bool,
        width: PropTypes.string,
        height: PropTypes.string
    }

    static defaultProps = {
        open: false,
        width: '450px',
        height: '500px'
    }

    onSave = () => {
        this.props.on();
        this.props.handleClose();
    }

    onCancel = () => {
        this.props.handleClose();
    }

    onClick = ({target}) => {
        console.log(target.className)
    }

    render() {
        const {open, onClick, children, ...rest} = this.props;
        return (
            <div {...rest}>
                <FloatingLayer
                    open={open}
                    onClick={onClick}
                >
                <div className={css.modalContent}>                    
                    {children}
                </div>
            </FloatingLayer>
            </div>
        )
    }
};

export default Modal;