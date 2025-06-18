
import { supabase } from "./client";

/**
 * Increments a numeric column by the given value
 * Returns the incremented value directly
 */
const increment = async (table: string, column: string, id: string, value: number = 1): Promise<number> => {
  try {
    console.log(`Incrementing ${column} in ${table} for id ${id} by ${value}`);
    
    // First get the current value
    const { data: currentData, error: fetchError } = await supabase
      .from(table as any)
      .select(column)
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching current value:', fetchError);
      throw fetchError;
    }
    
    const currentValue = currentData ? currentData[column] : 0;
    const newValue = (currentValue || 0) + value;
    
    console.log(`Current value: ${currentValue}, incrementing by ${value}, new value: ${newValue}`);
    
    // Update with the new value
    const { data, error } = await supabase
      .from(table as any)
      .update({ [column]: newValue })
      .eq('id', id)
      .select(column)
      .single();
      
    if (error) {
      console.error('Error updating value:', error);
      throw error;
    }
    
    const resultValue = data ? data[column] : newValue;
    console.log(`Successfully updated ${column} to ${resultValue}`);
    
    return resultValue;
  } catch (error) {
    console.error(`Error incrementing ${column} in ${table}:`, error);
    return 0;
  }
};

/**
 * Decrements a numeric column by the given value, ensuring it doesn't go below 0
 * Returns the decremented value directly
 */
const decrement = async (table: string, column: string, id: string, value: number = 1): Promise<number> => {
  try {
    console.log(`Decrementing ${column} in ${table} for id ${id} by ${value}`);
    
    // First get the current value
    const { data: currentData, error: fetchError } = await supabase
      .from(table as any)
      .select(column)
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching current value:', fetchError);
      throw fetchError;
    }
    
    const currentValue = currentData ? currentData[column] : 0;
    const newValue = Math.max(0, (currentValue || 0) - value); // Ensure it doesn't go below 0
    
    console.log(`Current value: ${currentValue}, decrementing by ${value}, new value: ${newValue}`);
    
    // Update with the new value
    const { data, error } = await supabase
      .from(table as any)
      .update({ [column]: newValue })
      .eq('id', id)
      .select(column)
      .single();
      
    if (error) {
      console.error('Error updating value:', error);
      throw error;
    }
    
    const resultValue = data ? data[column] : newValue;
    console.log(`Successfully updated ${column} to ${resultValue}`);
    
    return resultValue;
  } catch (error) {
    console.error(`Error decrementing ${column} in ${table}:`, error);
    return 0;
  }
};

export { increment, decrement };
