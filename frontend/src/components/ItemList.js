import React from 'react';
import PropTypes from 'prop-types';
import './ItemList.css';

const ItemList = ({items, itemProps, ItemComponent, itemName}) => (
    <div className="ItemList-container">
        {items && 
        items.map(t => { 
            const propObj = {};
            Object.keys(itemProps).forEach(p => propObj[p] = t[itemProps[p]]);
            return <ItemComponent {...propObj} />;
        })}
        {!items.length && (
            <div className='ItemList-placeholder'>
                You don't have any {itemName} yet!
            </div>
        )}
    </div>
);

ItemList.propTypes = {
    items: PropTypes.array.isRequired,
    itemProps: PropTypes.object,
    ItemComponent: PropTypes.elementType.isRequired,
    itemName: PropTypes.string.isRequired
};

export default ItemList;