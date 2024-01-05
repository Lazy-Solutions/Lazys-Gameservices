import { models } from "../../core/core.js";

const { Player: ExtendedPlayer } = models;

export class Player extends ExtendedPlayer
{
    constructor (id)
    {
        super(id);
        this.mmr = undefined;
    }

    // To be used for cleaning, so we don't need to reinstanciate the class.
    static referenceInstance = new Player(undefined);

    static cleanAndCheckForUnwantedProperties(dataToCheck)
    {
        const referenceProperties = Player.referenceInstance;

        const { id, createdAt, ...referencePropertiesWithoutFields } = referenceProperties;

        const currentProperties = Object.keys(dataToCheck);

        const unwantedProperties = currentProperties.filter(
            property => !referencePropertiesWithoutFields.hasOwnProperty(property)
        );

        if(unwantedProperties.length > 0)
        {
            // Create a cleaned copy of the data by excluding unwanted properties
            const cleanedData = { ...dataToCheck };
            unwantedProperties.forEach(property => delete cleanedData[property]);
            return { hasUnwantedProperties: true, cleanedData };
        }

        // No unwanted properties, return the original data
        return { hasUnwantedProperties: false, cleanedData: dataToCheck };
    }
}