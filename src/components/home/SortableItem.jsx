import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

export default function SortableItem({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        ...children.props.style
    };

    return React.cloneElement(children, {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners
    });
}
