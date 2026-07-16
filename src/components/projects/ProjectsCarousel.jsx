import React from 'react';
import {
    Carousel,
    CarouselNav,
    CarouselNavButton,
    CarouselNavContainer,
    CarouselSlider,
    CarouselViewport,
    makeStyles,
} from '@fluentui/react-components';

const useClasses = makeStyles({
    container: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '12px',
    },
    carousel: {
        padding: '12px 0',
    },
});

const getAnnouncement = (index, totalSlides) =>
    `Carousel: slide ${index + 1} of ${totalSlides}`;

export const ProjectsCarousel = ({ children }) => {
    const classes = useClasses();

    return (
        <div className={classes.container}>
            <Carousel
                className={classes.carousel}
                announcement={getAnnouncement}
                align="center"
                whitespace={false}
            >
                <CarouselViewport>
                    <CarouselSlider
                        cardFocus
                        aria-label="Use the arrows to navigate between the projects"
                    >
                        {children}
                    </CarouselSlider>
                </CarouselViewport>
                <CarouselNavContainer
                    layout="inline"
                    autoplayTooltip={children.length > 3 ? { content: 'Autoplay', relationship: 'label' } : ""}
                    next={children.length > 0 ? { 'aria-label': 'Next' } : ""}
                    prev={children.length > 0 ? { 'aria-label': 'Previous' } : ""} 
                >
                    <CarouselNav>
                        {(index) => (
                            <CarouselNavButton
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        )}
                    </CarouselNav>
                </CarouselNavContainer>
            </Carousel>
        </div>
    );
};