export function identifyOrganisms(particles, minOrgSize, organismRadius) {
    const organisms = [];
    const unclustered = new Set(particles);

    while (unclustered.size > 0) {
        const seed = unclustered.values().next().value;
        const cluster = growCluster(seed, unclustered, organismRadius);
        if (cluster.size >= minOrgSize) {
            const organismData = calculateOrganismData(cluster);
            organisms.push(organismData);
            for (const particle of cluster) {
                particle.organismId = organisms.length - 1;
            }
        } else {
            const smallOrgId = -organisms.length - 1;
            for (const particle of cluster) {
                particle.organismId = smallOrgId;
            }
        }
    }

    return organisms;
}

function growCluster(seed, unclustered, organismRadius) {
    const cluster = new Set([seed]);
    const queue = [seed];
    unclustered.delete(seed);

    while (queue.length > 0) {
        const particle = queue.shift();
        for (const other of unclustered) {
            if (distance(particle, other) <= organismRadius) {
                cluster.add(other);
                queue.push(other);
                unclustered.delete(other);
            }
        }
    }
    return cluster;
}

function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function calculateOrganismData(cluster) {
    let totalX = 0, totalY = 0, totalMass = 0;

    for (const particle of cluster) {
        totalX += particle.x * particle.size;
        totalY += particle.y * particle.size;
        totalMass += particle.size;
    }

    return {
        centerOfMass: {
            x: totalX / totalMass,
            y: totalY / totalMass
        },
        particles: Array.from(cluster)
    };
}

export function updateOrganismCenterOfMass(organism) {
    let totalX = 0, totalY = 0, totalMass = 0;
    organism.particles.forEach(particle => {
        totalX += particle.x * particle.size;
        totalY += particle.y * particle.size;
        totalMass += particle.size;
    });
    organism.centerOfMass.x = totalX / totalMass;
    organism.centerOfMass.y = totalY / totalMass;
}